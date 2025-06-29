$(function () {
  var pageSize = 10;
  var currentPage = 1;

  function loadUsers(page) {
    $.get('http://localhost:5000/api/User', { pageNumber: page, pageSize: pageSize })
      .done(function (res) {
        renderTable(res.items, res.pageNumber, res.pageSize);
        renderPagination(res.pageNumber, res.totalPages);
      })
      .fail(function () {
        alert('Không thể tải dữ liệu người dùng.');
      });
  }

  function renderTable(items, pageNumber, pageSize) {
    var tbody = $('#userTable tbody');
    tbody.empty();
    if (!items || !items.length) {
      tbody.append('<tr><td colspan="7" class="text-center">Không có dữ liệu</td></tr>');
      return;
    }

    $.each(items, function (index, user) {
      var rowNumber = (pageNumber - 1) * pageSize + index + 1;
      var row =
        '<tr>' +
        '<td>' + rowNumber + '</td>' +
        '<td>' + user.userID + '</td>' +
        '<td>' + user.staffID + '</td>' +
        '<td>' + user.roleID + '</td>' +
        '<td>' + user.email + '</td>' +
        '<td>' + formatDate(user.createdDate) + '</td>' +
        '<td>' + user.status + '</td>' +
        '</tr>';
      tbody.append(row);
    });
  }

  function renderPagination(pageNumber, totalPages) {
    var pagination = $('#pagination');
    pagination.empty();

    // Prev
    var prevClass = pageNumber === 1 ? 'disabled' : '';
    pagination.append('<li class="' + prevClass + '"><a href="#" data-page="' + (pageNumber - 1) + '">«</a></li>');

    // Page Numbers (show up to 5 pages around current)
    var startPage = Math.max(1, pageNumber - 2);
    var endPage = Math.min(totalPages, pageNumber + 2);
    for (var i = startPage; i <= endPage; i++) {
      var activeClass = i === pageNumber ? 'active' : '';
      pagination.append('<li class="' + activeClass + '"><a href="#" data-page="' + i + '">' + i + '</a></li>');
    }

    // Next
    var nextClass = pageNumber === totalPages ? 'disabled' : '';
    pagination.append('<li class="' + nextClass + '"><a href="#" data-page="' + (pageNumber + 1) + '">»</a></li>');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  }

  // Click handler
  $('#pagination').on('click', 'a', function (e) {
    e.preventDefault();
    var targetPage = parseInt($(this).data('page'));
    if (!isNaN(targetPage) && targetPage > 0) {
      currentPage = targetPage;
      loadUsers(currentPage);
      $(window).scrollTop(0);
    }
  });

  // Initial load
  loadUsers(currentPage);
}); 