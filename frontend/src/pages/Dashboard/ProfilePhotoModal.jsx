import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Loader } from 'lucide-react';
import Button from '../../components/ui/Button';
import { authService } from '../../services/authService';

const SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 25
};

const ProfilePhotoModal = ({ isOpen, onClose, currentPhoto, onPhotoUpdated }) => {
  const [selectedImage, setSelectedImage] = useState(currentPhoto || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      await authService.updateProfilePhoto(selectedImage);
      onPhotoUpdated(selectedImage);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={SPRING}
          className="relative bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-purple-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors duration-150"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-3xl blur-2xl animate-pulse" />

          {/* Content */}
          <div className="relative">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50"
              >
                <Camera className="w-10 h-10 text-white" />
              </motion.div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white text-center mb-3">
              {currentPhoto ? 'update profile photo' : 'add profile photo'} 📸
            </h2>
            <p className="text-gray-400 text-center mb-6">
              choose an image that represents you
            </p>

            {/* Image Preview */}
            <div className="mb-6 flex justify-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30">
                {selectedImage ? (
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Upload className="w-12 h-12 text-white/50" />
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <p className="text-red-400 text-sm text-center">{error}</p>
              </motion.div>
            )}

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                className="w-full"
                disabled={isUploading}
              >
                <Upload className="w-5 h-5 mr-2" />
                {selectedImage ? 'choose different image' : 'select image'}
              </Button>

              {selectedImage && (
                <Button
                  onClick={handleUpload}
                  variant="primary"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      {currentPhoto ? 'update photo' : 'set photo'}
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Info notice */}
            <p className="text-center text-gray-400 text-xs mt-4">
              💡 max size: 2MB • formats: jpg, png, gif, webp
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfilePhotoModal;

