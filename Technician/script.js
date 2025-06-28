let patients = JSON.parse(localStorage.getItem("patients")) || [];
let requests = [
    { patient: "Nguyễn Văn A", department: "Chẩn đoán hình ảnh", type: "X-quang", status: "Chưa thực hiện" },
    { patient: "Trần Thị B", department: "Tim mạch", type: "MRI", status: "Chưa thực hiện" }
];

function renderTable() {
    const tbody = document.getElementById("requestTable");
    tbody.innerHTML = "";

    requests.forEach((r, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.patient}</td>
            <td>${r.department}</td>
            <td>${r.type}</td>
            <td>${r.status}</td>
            <td>
                <button class="upload-btn" onclick="openUploadModal(${index})">Tải DICOM</button>
                <button class="view-btn" onclick="viewImage(${index})">Xem hình</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openUploadModal(index) {
    document.getElementById("scanType").value = ""; // Reset dropdown
    document.getElementById("dicomFile").value = "";
    document.getElementById("note").value = "";

    document.getElementById("uploadForm").onsubmit = function(e) {
        e.preventDefault();

        const selectedType = document.getElementById("scanType").value;
        if (!selectedType) {
            alert("Vui lòng chọn loại chụp!");
            return;
        }

        requests[index].type = selectedType;
        requests[index].status = "Đã tải DICOM";
        renderTable();
        closeModal();
        alert("Tải hình ảnh DICOM thành công!");
    };
    document.getElementById("uploadModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("uploadModal").style.display = "none";
}

function viewImage(index) {
  const name = requests[index].patient;
  const patient = patients.find(p => p.name === name);

  if (!patient || !patient.dicomImage) {
    alert("Chưa có ảnh DICOM để xem.");
    return;
  }

  document.getElementById("dicomPreview").src = patient.dicomImage;
  document.getElementById("dicomNote").innerText = patient.dicomNote || "Không có";
  document.getElementById("dicomQuality").innerText = patient.dicomQuality || "Không rõ";

  document.getElementById("viewModal").style.display = "flex";
}

function closeViewModal() {
  document.getElementById("viewModal").style.display = "none";
}

renderTable();
