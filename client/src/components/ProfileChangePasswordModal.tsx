import React from 'react';

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ProfileChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  passwordData: PasswordData;
  setPasswordData: React.Dispatch<React.SetStateAction<PasswordData>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const ProfileChangePasswordModal: React.FC<ProfileChangePasswordModalProps> = ({
  isOpen,
  onClose,
  passwordData,
  setPasswordData,
  onSubmit,
  isSubmitting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Disabled Feature</h3>
          <p className="text-red-900 dark:text-red-400 text-sm font-medium mb-6 whitespace-nowrap">
            This feature is disabled for security reasons for this demo (｡•́︿•̀｡)
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-md hover:from-cyan-600 hover:to-purple-700 transition-all duration-200"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileChangePasswordModal;