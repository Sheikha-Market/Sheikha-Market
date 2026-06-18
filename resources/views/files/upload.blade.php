<!-- نموذج رفع الملفات -->
<div class="file-upload-form">
    <h2>رفع الملفات إلى Google Cloud Storage</h2>

    @if ($errors->any())
        <div class="alert alert-danger">
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form id="uploadForm" enctype="multipart/form-data">
        @csrf

        <div class="form-group">
            <label for="file">اختر الملف</label>
            <input
                type="file"
                id="file"
                name="file"
                required
                accept="*/*"
                class="form-control"
            >
            <small>الحد الأقصى: 50 MB</small>
        </div>

        <div class="form-group">
            <label for="category">التصنيف</label>
            <select id="category" name="category" class="form-control" required>
                <option value="">اختر التصنيف</option>
                <option value="products">المنتجات</option>
                <option value="documents">الوثائق</option>
                <option value="backups">النسخ الاحتياطية</option>
                <option value="analytics">التحليلات</option>
                <option value="images">الصور</option>
            </select>
        </div>

        <div class="form-group">
            <label for="description">الوصف</label>
            <textarea
                id="description"
                name="description"
                class="form-control"
                rows="3"
                placeholder="أضف وصفاً للملف..."
            ></textarea>
        </div>

        <div class="progress" id="uploadProgress" style="display: none;">
            <div class="progress-bar" role="progressbar" style="width: 0%"></div>
        </div>

        <button type="submit" class="btn btn-primary">رفع الملف</button>
    </form>

    <div id="uploadResult" class="upload-result"></div>
</div>

<style>
.file-upload-form {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.file-upload-form h2 {
    margin-bottom: 1.5rem;
    color: #1f2937;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
}

.form-control {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
}

.form-control:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover {
    background: #2563eb;
}

.progress {
    margin: 1rem 0;
    height: 0.5rem;
    background: #e5e7eb;
    border-radius: 0.375rem;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background: #10b981;
    transition: width 0.2s ease;
}

.upload-result {
    margin-top: 1rem;
}

.alert {
    padding: 1rem;
    border-radius: 0.375rem;
    margin-bottom: 1rem;
}

.alert-danger {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
}
</style>

<script>
document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const progressBar = document.getElementById('uploadProgress');
    const progressFill = progressBar.querySelector('.progress-bar');
    const resultDiv = document.getElementById('uploadResult');

    progressBar.style.display = 'block';

    try {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressFill.style.width = percentComplete + '%';
            }
        });

        xhr.addEventListener('load', function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                resultDiv.innerHTML = `
                    <div class="alert alert-success">
                        <h4>✅ تم رفع الملف بنجاح!</h4>
                        <p>الملف: ${response.file.path}</p>
                        <p>الحجم: ${(response.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <a href="${response.file.url}" target="_blank">عرض الملف</a>
                    </div>
                `;
                document.getElementById('uploadForm').reset();
                progressBar.style.display = 'none';
            } else {
                resultDiv.innerHTML = `
                    <div class="alert alert-danger">
                        خطأ: ${JSON.parse(xhr.responseText).error}
                    </div>
                `;
            }
        });

        xhr.open('POST', '{{ route("files.store") }}', true);
        xhr.setRequestHeader('X-CSRF-TOKEN', document.querySelector('meta[name="csrf-token"]').content);
        xhr.send(formData);

    } catch (error) {
        resultDiv.innerHTML = `
            <div class="alert alert-danger">
                حدث خطأ: ${error.message}
            </div>
        `;
    }
});
</script>
