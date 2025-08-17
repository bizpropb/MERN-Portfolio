import React, { useState } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
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

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  editData,
  setEditData,
  onSubmit,
  isSubmitting
}) => {
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Edit Profile</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={editData.username}
                onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={editData.firstName}
                onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={editData.lastName}
                onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Avatar URL
              </label>
              <input
                type="url"
                value={editData.avatar}
                onChange={(e) => setEditData(prev => ({ ...prev, avatar: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            {/* Location Fields */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <MapPinIcon className="w-4 h-4 mr-2" />
                Location (Optional)
              </h4>
              
              {/* Current Location Display */}
              {editData.location?.latitude && editData.location?.longitude ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      Current Location:
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {editData.location?.city && editData.location?.country
                        ? `${editData.location.city}, ${editData.location.country}`
                        : 'Custom coordinates'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {parseFloat(editData.location?.latitude || '0').toFixed(6)}, {parseFloat(editData.location?.longitude || '0').toFixed(6)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  No location selected
                </div>
              )}

              {/* Location Picker Button */}
              <button
                type="button"
                onClick={() => setIsLocationPickerOpen(true)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
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
                  className="w-full mt-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  Clear Location
                </button>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-md hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
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