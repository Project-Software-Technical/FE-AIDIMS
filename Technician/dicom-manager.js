let patients = JSON.parse(localStorage.getItem("patients")) || [];
let images = JSON.parse(localStorage.getItem("dicomImages")) || {};
let selectedPatient = null;

const patientSelect = document.getElementById("patientSelect");
const imageList = document.getElementById("imageList");
const uploadForm = document.getElementById("uploadForm");

// Populate dropdown
function loadPatientList() {
  patientSelect.innerHTML = "";
  let hasValidPatient = false;

  patients.forEach((p, index) => {
    if (p.dicomRequested) {
      const opt = document.createElement("option");
      opt.value = index;
      opt.textContent = p.name + (p.dicomType ? ` (${p.dicomType})` : "");
      patientSelect.appendChild(opt);
      hasValidPatient = true;
    }
  });

  if (hasValidPatient) {
    selectedPatient = patientSelect.value;
    renderImages();
  } else {
    selectedPatient = null;
    imageList.innerHTML = "<p style='color:gray'>Không có bệnh nhân nào yêu cầu chụp.</p>";
  }
}


// Render image list
function renderImages() {
  const pid = patientSelect.value;
  const imgs = images[pid] || [];
  imageList.innerHTML = "";

  if (imgs.length === 0) {
    imageList.innerHTML = "<p style='color:gray'>Chưa có ảnh nào.</p>";
    return;
  }

  imgs.forEach((img, i) => {
    const div = document.createElement("div");
    div.className = "image-card";
    div.innerHTML = `
      <img src="${img.url}" alt="DICOM image ${i}" />
      <p><strong>Ghi chú:</strong> ${img.note}</p>
      <p><strong>Chất lượng:</strong> ${img.quality}</p>
      <button onclick="deleteImage(${i})">Xóa ảnh</button>
    `;
    imageList.appendChild(div);
  });
}

// Upload image
uploadForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const fileInput = document.getElementById("dicomImage");
  const note = document.getElementById("imageNote").value;
  const quality = document.getElementById("imageQuality").value;
  const reader = new FileReader();

  if (!fileInput.files.length) {
    alert("Vui lòng chọn ảnh!");
    return;
  }

  reader.onload = function (event) {
    const pid = patientSelect.value;
    const newImage = {
      url: event.target.result,
      note,
      quality
    };

    if (!images[pid]) {
      images[pid] = [];
    }

    images[pid].push(newImage);
    localStorage.setItem("dicomImages", JSON.stringify(images));
    renderImages();
    uploadForm.reset();
  };

  reader.readAsDataURL(fileInput.files[0]);
});

// Xóa ảnh
function deleteImage(index) {
  const pid = patientSelect.value;
  if (confirm("Bạn có chắc chắn muốn xóa ảnh này?")) {
    images[pid].splice(index, 1);
    localStorage.setItem("dicomImages", JSON.stringify(images));
    renderImages();
  }
}

// Khi chọn bệnh nhân
patientSelect.addEventListener("change", () => {
  selectedPatient = patientSelect.value;
  renderImages();
});

// Load dữ liệu ban đầu
loadPatientList();

$(function(){
  var baseUrl = 'https://localhost:5001';
  var techId = sessionStorage.getItem('technicianId');
  if(!techId){ alert('Không xác định technicianId'); }

  var params = new URLSearchParams(window.location.search);
  var requestId = params.get('requestId');
  if(!requestId){ alert('Thiếu requestId'); return; }

  var recordId = 0;
  var patientName='';

  function loadRequest(){
    $.get(baseUrl+'/api/ImagingRequest/'+requestId)
      .done(function(r){
        recordId = r.recordID;
        patientName = r.patientName || '';
        $('#patientInfo').text(patientName);
        loadImages();
      }).fail(function(){ alert('Không lấy được yêu cầu'); });
  }

  function loadImages(){
    $.get(baseUrl+'/api/DicomImage/record/'+recordId)
      .done(function(list){ renderImages(list.items||list); });
  }

  function renderImages(list){
    var container = $('#imageList');
    container.empty();
    if(!list.length){ container.append('<p class="text-muted">Chưa có ảnh.</p>'); return; }
    list.forEach(function(img){
      var card = $('<div class="image-card"/>');
      card.append('<img src="'+img.filePath+'" />');
      card.append('<p><strong>Loại:</strong> '+(img.imageType||'-')+'</p>');
      card.append('<p><strong>Doctor:</strong> '+(img.doctorNotes||'-')+'</p>');
      container.append(card);
    });
  }

  /* Upload */
  $('#uploadForm').submit(function(e){
    e.preventDefault();
    if(!recordId) return;
    var fileUrl = $('#dicomImageUrl').val().trim();
    var note = $('#imageNote').val();
    var type = $('#imageType').val();
    if(!fileUrl){ alert('Nhập URL ảnh'); return; }
    var payload = {
      recordID: recordId,
      technicianID: parseInt(techId),
      doctorNotes: note,
      filePath: fileUrl,
      imageType: type,
      fileSize: 0,
      resolution: '',
      isApproved: false,
      aiFeedback: ''
    };
    $.ajax({url: baseUrl+'/api/DicomImage',method:'POST',contentType:'application/json',data:JSON.stringify(payload)})
      .done(function(){
        // update imaging request status to Done
        $.ajax({url: baseUrl+'/api/ImagingRequest/'+requestId,method:'PUT',contentType:'application/json',data:JSON.stringify({status:'Done', executionDate:new Date().toISOString()})});
        loadImages();
        $('#uploadForm')[0].reset();
      }).fail(function(){ alert('Tải ảnh thất bại'); });
  });

  loadRequest();
});
