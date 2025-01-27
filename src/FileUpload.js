// FileUpload.js
import React, { useState } from 'react';

const FileUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/api/v1/customer/123456/segment/file', {
        method: 'POST',
        body: formData,
      });

      console.log(response);

      if (response.ok) {
        alert('File uploaded successfully!');
      } else {
        alert('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Upload File</h2>
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fileInput" className="form-label">
                Choose a file
              </label>
              <input
                type="file"
                id="fileInput"
                className="form-control"
                onChange={handleFileChange}
              />
            </div>
            <div className="text-center">
              <button type="submit" className="btn btn-primary mt-3">
                Upload
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
