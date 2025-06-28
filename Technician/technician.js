// technician.js - danh sách yêu cầu DICOM

$(function () {
  var baseUrl = 'https://localhost:5001';
  var techId = sessionStorage.getItem('technicianId');
  if (!techId) {
    alert('Không xác định technicianId, hãy đăng nhập lại.');
  }

  function loadRequests() {
    $.get(baseUrl + '/api/ImagingRequest', { pageNumber: 1, pageSize: 100 })
      .done(function (data) {
        var list = data.items || data;
        renderTable(list.filter(function (r) { return !r.status || r.status.toLowerCase() !== 'done'; }));
      });
  }

  function renderTable(list) {
    var tbody = $('#requestTable');
    tbody.empty();
    if (!list.length) {
      tbody.append('<tr><td colspan="7" class="text-center text-muted">Không có yêu cầu.</td></tr>');
      return;
    }
    $.each(list, function (i, r) {
      var tr = $('<tr/>');
      tr.append('<td>' + (r.patientName || '-') + '</td>');
      tr.append('<td>-</td>');
      tr.append('<td>' + (r.serviceName || '-') + '</td>');
      tr.append('<td>-</td>');
      tr.append('<td>' + (r.serviceName || '-') + '</td>');
      tr.append('<td>' + (r.status || '-') + '</td>');
      tr.append('<td><button class="upload-btn" data-id="' + r.requestID + '">Tải DICOM</button></td>');
      tbody.append(tr);
    });
  }

  $('#requestTable').on('click', '.upload-btn', function () {
    var reqId = $(this).data('id');
    window.location.href = 'dicom-manager.html?requestId=' + reqId;
  });

  loadRequests();
}); 