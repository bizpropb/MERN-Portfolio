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

// Modal component that displays a security notice about disabled password change functionality
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="lightmode dark:darkmode rounded-lg shadow-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <h3 className="text-lg mb-4 lightmode-text-primary dark:darkmode-text-primary">Disabled Feature</h3>
          <p className="text-danger text-sm font-medium mb-6 whitespace-nowrap">
            This feature is disabled for security reasons (｡•́︿•̀｡)
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 btn-primary text-xs"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileChangePasswordModal;