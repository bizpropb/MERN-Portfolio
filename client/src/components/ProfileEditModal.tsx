import React, { useState } from 'react';
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LocationPickerModal from './LocationPickerModal';

interface EditData {
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatar: string;
  location: {
    latitude: string;
    longitude: string;
    city: string;
    country: string;
  };
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData: EditData;
  setEditData: React.Dispatch<React.SetStateAction<EditData>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

// Modal form for editing user profile information including location selection
const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  editData,
  setEditData,
  onSubmit,
  isSubmitting
}) => {
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Updates profile data with selected location coordinates and address info
  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  }) => {
    setEditData(prev => ({
      ...prev,
      location: {
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        city: location.city,
        country: location.country
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="lightmode lightmode-text-primary dark:darkmode dark:darkmode-text-primary rounded-lg shadow-xl max-w-md w-full min-w-0 mx-2 sm:mx-0 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg ">Edit Profile</h3>
          <button
            onClick={onClose}
            className="p-2 text-primary hover:text-red-500"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium lightmode-text-primary dark:darkmode-text-primary mb-1">
                Username
              </label>
              <input
                type="text"
                value={editData.username}
                onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border lightmode lightmode-text-secondary dark:darkmode dark:darkmode-text-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium lightmode-text-primary dark:darkmode-text-primary mb-1">
                First Name
              </label>
              <input
                type="text"
                value={editData.firstName}
                onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border lightmode lightmode-text-secondary dark:darkmode dark:darkmode-text-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium lightmode-text-primary dark:darkmode-text-primary mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={editData.lastName}
                onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border lightmode lightmode-text-secondary dark:darkmode dark:darkmode-text-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium lightmode-text-primary dark:darkmode-text-primary mb-1">
                Bio
              </label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border lightmode lightmode-text-secondary dark:darkmode dark:darkmode-text-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium lightmode-text-primary dark:darkmode-text-primary mb-1">
                Avatar URL
              </label>
              <input
                type="url"
                value={editData.avatar}
                onChange={(e) => setEditData(prev => ({ ...prev, avatar: e.target.value }))}
                className="w-full px-3 py-2 border lightmode lightmode-text-secondary dark:darkmode dark:darkmode-text-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            {/* Location Fields */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium lightmode-text-primary dark:darkmode-text-primary mb-3 flex items-center">
                <MapPinIcon className="w-4 h-4 mr-2" />
                Location (Optional)
              </h4>
              
              {/* Current Location Display */}
              {editData.location?.latitude && editData.location?.longitude ? (
                <div className="lightmode-highlight dark:darkmode-highlight rounded-lg p-3 mb-3">
                  <div className="text-sm">
                    <div className="font-medium mb-1">
                      Current Location:
                    </div>
                    <div className="lightmode-text-secondary dark:darkmode-text-secondary">
                      {editData.location?.city && editData.location?.country
                        ? `${editData.location.city}, ${editData.location.country}`
                        : 'Custom coordinates'}
                    </div>
                    <div className="text-xs lightmode-text-secondary dark:darkmode-text-secondary mt-1">
                      {parseFloat(editData.location?.latitude || '0').toFixed(6)}, {parseFloat(editData.location?.longitude || '0').toFixed(6)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm lightmode-text-secondary dark:darkmode-text-secondary mb-3">
                  No location selected
                </div>
              )}

              {/* Location Picker Button */}
              <button
                type="button"
                onClick={() => setIsLocationPickerOpen(true)}
                className="text-xs btn-primary w-full px-4 py-2 rounded-md flex items-center justify-center space-x-2"
              >
                <MapPinIcon className="w-4 h-4" />
                <span>{editData.location?.latitude ? 'Change Location' : 'Select Location on Map'}</span>
              </button>

              {/* Clear Location Button */}
              {editData.location?.latitude && (
                <button
                  type="button"
                  onClick={() => setEditData(prev => ({
                    ...prev,
                    location: { latitude: '', longitude: '', city: '', country: '' }
                  }))}
                  className="text-xs text-primary w-full mt-2 px-4 py-2 text-sm text-danger hover:text-red-500"
                >
                  Clear Location
                </button>
              )}
            </div>

            <div className="text-xs flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 btn-primary-filled"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-xs px-4 py-2 lightmode dark:darkmode text-lightmode-text-primary dark:darkmode-text-primary rounded-md hover:lightmode-highlight dark:hover:darkmode-highlight transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={
          editData.location?.latitude && editData.location?.longitude
            ? {
                latitude: parseFloat(editData.location.latitude),
                longitude: parseFloat(editData.location.longitude)
              }
            : undefined
        }
      />
    </div>
  );
};

export default ProfileEditModal;