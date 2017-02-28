$.ajax({
  type: 'GET',
  url: 'http://cloud.dean.technology:9000/test/all',
  beforeSend: function(xhr) {
    xhr.setRequestHeader('Authorization', "Bearer 12345");
  },
  success: function(data) {console.log(data);}
});

