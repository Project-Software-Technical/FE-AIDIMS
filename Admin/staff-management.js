$(function () {
  var pageSize = 10;
  var currentPage = 1;
  var editingID = null;

  function loadStaff(page) {
    $.get('http://localhost:5000/api/HospitalStaff', { pageNumber: page, pageSize: pageSize })
      .done(function (res) {
        renderTable(res.items, res.pageNumber, res.pageSize);
        renderPagination(res.pageNumber, res.totalPages);
      })
      .fail(function () {
        alert('Không thể tải dữ liệu nhân viên.');
      });
  }

  function renderTable(items, pageNumber, pageSize) {
    var tbody = $('#staffTable tbody');
    tbody.empty();
    if (!items || !items.length) {
      tbody.append('<tr><td colspan="9" class="text-center">Không có dữ liệu</td></tr>');
      return;
    }

    $.each(items, function (index, staff) {
      var rowNumber = (pageNumber - 1) * pageSize + index + 1;
      var row =
        '<tr>' +
        '<td>' + rowNumber + '</td>' +
        '<td>' + staff.staffID + '</td>' +
        '<td>' + staff.fullName + '</td>' +
        '<td>' + formatDate(staff.birthDate) + '</td>' +
        '<td>' + staff.gender + '</td>' +
        '<td>' + staff.position + '</td>' +
        '<td>' + staff.email + '</td>' +
        '<td>' + staff.status + '</td>' +
        '<td>' +
          '<button class="btn btn-xs btn-primary edit-btn" data-id="' + staff.staffID + '"><span class="glyphicon glyphicon-pencil"></span></button> ' +
          '<button class="btn btn-xs btn-danger delete-btn" data-id="' + staff.staffID + '"><span class="glyphicon glyphicon-trash"></span></button> ' +
          '<button class="btn btn-xs btn-info account-btn" data-id="' + staff.staffID + '" data-email="' + staff.email + '"><span class="glyphicon glyphicon-user"></span></button>' +
        '</td>' +
        '</tr>';
      tbody.append(row);
    });
  }

  function renderPagination(pageNumber, totalPages) {
    var pagination = $('#pagination');
    pagination.empty();

    var prevClass = pageNumber === 1 ? 'disabled' : '';
    pagination.append('<li class="' + prevClass + '"><a href="#" data-page="' + (pageNumber - 1) + '">«</a></li>');

    var startPage = Math.max(1, pageNumber - 2);
    var endPage = Math.min(totalPages, pageNumber + 2);
    for (var i = startPage; i <= endPage; i++) {
      var activeClass = i === pageNumber ? 'active' : '';
      pagination.append('<li class="' + activeClass + '"><a href="#" data-page="' + i + '">' + i + '</a></li>');
    }

    var nextClass = pageNumber === totalPages ? 'disabled' : '';
    pagination.append('<li class="' + nextClass + '"><a href="#" data-page="' + (pageNumber + 1) + '">»</a></li>');
  }

  function openModal(isEdit, data) {
    if (isEdit) {
      $('#modalTitle').text('Chỉnh sửa Nhân viên');
      $('#staffID').val(data.staffID);
      $('#fullName').val(data.fullName);
      $('#birthDate').val(toInputDate(data.birthDate));
      $('#gender').val(data.gender);
      $('#address').val(data.address);
      $('#phone').val(data.phone);
      $('#email').val(data.email);
      $('#position').val(data.position);
      $('#status').val(data.status);
      editingID = data.staffID;
    } else {
      $('#modalTitle').text('Thêm Nhân viên');
      $('#staffForm')[0].reset();
      $('#staffID').val('');
      editingID = null;
    }
    $('#staffModal').modal('show');
  }

  function toInputDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().substring(0, 10);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  }

  $('#addStaffBtn').click(function () {
    openModal(false);
  });

  $('#staffTable').on('click', '.edit-btn', function () {
    var id = $(this).data('id');
    $.get('http://localhost:5000/api/HospitalStaff/' + id)
      .done(function (data) {
        openModal(true, data);
      })
      .fail(function () {
        alert('Không thể lấy dữ liệu nhân viên.');
      });
  });

  $('#staffTable').on('click', '.delete-btn', function () {
    var id = $(this).data('id');
    if (confirm('Bạn có chắc muốn xoá nhân viên này?')) {
      $.ajax({
        url: 'http://localhost:5000/api/HospitalStaff/' + id,
        method: 'DELETE',
      })
        .done(function () {
          loadStaff(currentPage);
        })
        .fail(function () {
          alert('Xoá thất bại.');
        });
    }
  });

  $('#staffTable').on('click', '.account-btn', function () {
    var staffId = $(this).data('id');
    var emailDefault = $(this).data('email') || '';

    // Kiểm tra xem nhân viên đã có tài khoản chưa
    $.get('http://localhost:5000/api/user/by-staff/' + staffId)
      .done(function (acc) {
        // Đã có tài khoản → chế độ cập nhật
        $('#modalTitle').text('Cập nhật tài khoản');
        $('#accountStaffID').val(acc.staffID);
        $('#accountEmail').val(acc.email);
        $('#accountRoleID').val(acc.roleID);
        $('#accountStatus').val(acc.status || 'Active');
        $('#accountPassword').val(''); // để trống nếu không đổi
        $('#accountModal').data('is-update', true); // gắn cờ cập nhật
        $('#accountModal').modal('show');
      })
      .fail(function () {
        // Chưa có tài khoản → chế độ tạo mới
        $('#modalTitle').text('Cấp tài khoản cho nhân viên');
        $('#accountStaffID').val(staffId);
        $('#accountEmail').val(emailDefault);
        $('#accountRoleID').val('');
        $('#accountStatus').val('Active');
        $('#accountPassword').val('');
        $('#accountModal').data('is-update', false);
        $('#accountModal').modal('show');
      });
  });

  $('#accountForm').submit(function (e) {
    e.preventDefault();
    var payload = {
      staffID: parseInt($('#accountStaffID').val()),
      roleID: parseInt($('#accountRoleID').val()),
      email: $('#accountEmail').val(),
      password: $('#accountPassword').val(),
      status: $('#accountStatus').val(),
    };

    var isUpdate = $('#accountModal').data('is-update');
    var ajaxOpts = {
      contentType: 'application/json',
      data: JSON.stringify(payload),
    };

    if (isUpdate) {
      ajaxOpts.url = 'http://localhost:5000/api/user/by-staff/' + payload.staffID;
      ajaxOpts.method = 'PUT';
    } else {
      ajaxOpts.url = 'http://localhost:5000/api/User';
      ajaxOpts.method = 'POST';
    }

    $.ajax(ajaxOpts)
      .done(function () {
        alert((isUpdate ? 'Cập nhật' : 'Cấp') + ' tài khoản thành công');
        $('#accountModal').modal('hide');
      })
      .fail(function () {
        alert((isUpdate ? 'Cập nhật' : 'Cấp') + ' tài khoản thất bại');
      });
  });

  $('#staffForm').submit(function (e) {
    e.preventDefault();
    var payload = {
      fullName: $('#fullName').val(),
      birthDate: $('#birthDate').val(),
      gender: $('#gender').val(),
      address: $('#address').val(),
      phone: $('#phone').val(),
      email: $('#email').val(),
      position: $('#position').val(),
      status: $('#status').val(),
    };

    // Ghi log payload khi thêm mới nhân viên (không ở chế độ chỉnh sửa)
    if (!editingID) {
      console.log('Payload tạo nhân viên:', payload);
    }

    var ajaxOptions = {};
    if (editingID) {
      ajaxOptions = {
        url: 'http://localhost:5000/api/HospitalStaff/' + editingID,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(payload),
      };
    } else {
      ajaxOptions = {
        url: 'http://localhost:5000/api/HospitalStaff',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
      };
    }

    $.ajax(ajaxOptions)
      .done(function () {
        alert((editingID ? 'Cập nhật' : 'Thêm') + ' nhân viên thành công');
        $('#staffModal').modal('hide');
        loadStaff(currentPage);
      })
      .fail(function () {
        alert('Lưu dữ liệu thất bại.');
      });
  });

  $('#pagination').on('click', 'a', function (e) {
    e.preventDefault();
    var targetPage = parseInt($(this).data('page'));
    if (!isNaN(targetPage) && targetPage > 0) {
      currentPage = targetPage;
      loadStaff(currentPage);
      $(window).scrollTop(0);
    }
  });

  // Initial
  loadStaff(currentPage);
}); 