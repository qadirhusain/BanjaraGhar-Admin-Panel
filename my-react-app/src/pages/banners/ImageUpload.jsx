import { useState } from "react";
import toast from "react-hot-toast";
import { uploadBannerImage } from "../../api/bannerApi";
import { getErrorMessage } from "../../utils/error";
import { imageUrl } from "../../utils/image";

const MAX_SIZE = 5 * 1024 * 1024;

export default function ImageUpload({
  label,
  value,
  onChange,
  required = false,
  upload = uploadBannerImage,
}) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_SIZE) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }

    setUploading(true);
    try {
      const { url } = await upload(file);
      onChange(url);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form__field">
      <span>
        {label} {required && "*"}
      </span>
      {value && (
        <img className="image-upload__preview" src={imageUrl(value)} alt="" />
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        disabled={uploading}
      />
      {uploading && <small>Uploading...</small>}
      {value && !required && (
        <button type="button" className="btn" onClick={() => onChange("")}>
          Remove image
        </button>
      )}
    </div>
  );
}
