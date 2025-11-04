// src/components/forms/RestaurantSubmissionForm.js
import { useState } from 'react';
import { MapPinIcon, BuildingOfficeIcon, EnvelopeIcon, PhoneIcon, GlobeAltIcon, UserIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for file uploads
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  return null;
};

export default function RestaurantSubmissionForm() {
  const [formData, setFormData] = useState({
    restaurantName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    website: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    isRestaurantOwner: false,
    submissionNotes: '',
  });
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum file size is 5MB.`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length + photos.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }

    const newPhotos = [...photos, ...validFiles];
    setPhotos(newPhotos);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input
    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Upload photos to Supabase Storage first
      const photoUrls = [];
      if (photos.length > 0) {
        const supabase = getSupabaseClient();
        
        if (supabase) {
          const bucketName = 'restaurant-images';

          for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];
            const fileExt = photo.name.split('.').pop();
            const fileName = `submissions/${Date.now()}_${i}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            try {
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, photo, {
                  contentType: photo.type,
                  upsert: false,
                });

              if (uploadError) {
                console.error(`Error uploading photo ${i}:`, uploadError);
                continue;
              }

              // Get public URL
              const { data: urlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(uploadData.path);

              photoUrls.push(urlData.publicUrl);
            } catch (error) {
              console.error(`Error processing photo ${i}:`, error);
            }
          }
        }
      }

      // Send form data with photo URLs
      const response = await fetch('/api/submit-restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          photoUrls: photoUrls,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          restaurantName: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
          website: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          isRestaurantOwner: false,
          submissionNotes: '',
        });
        setPhotos([]);
        setPhotoPreviews([]);
      } else {
        setSubmitStatus('error');
        console.error('Submission error:', data.error);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Restaurant Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <BuildingOfficeIcon className="h-5 w-5 text-orange-600" />
          Restaurant Information
        </h3>
        
        <div>
          <label htmlFor="restaurantName" className="block text-sm font-medium text-neutral-700 mb-2">
            Restaurant Name <span className="text-orange-600">*</span>
          </label>
          <input
            type="text"
            id="restaurantName"
            name="restaurantName"
            required
            value={formData.restaurantName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="Enter restaurant name"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-2">
            Address <span className="text-orange-600">*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="Street address"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-2">
              City <span className="text-orange-600">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="City"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-neutral-700 mb-2">
              State <span className="text-orange-600">*</span>
            </label>
            <input
              type="text"
              id="state"
              name="state"
              required
              maxLength="2"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all uppercase"
              placeholder="State (e.g., NY)"
            />
          </div>
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-neutral-700 mb-2">
            ZIP Code
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="ZIP code"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-1">
              <PhoneIcon className="h-4 w-4" />
              Restaurant Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-1">
              <GlobeAltIcon className="h-4 w-4" />
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 pt-4 border-t border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-orange-600" />
          Your Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-neutral-700 mb-2">
              Your Name <span className="text-orange-600">*</span>
            </label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              required
              value={formData.contactName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-1">
              <EnvelopeIcon className="h-4 w-4" />
              Email <span className="text-orange-600">*</span>
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              required
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-neutral-700 mb-2">
            Your Phone
          </label>
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="isRestaurantOwner"
            name="isRestaurantOwner"
            checked={formData.isRestaurantOwner}
            onChange={handleChange}
            className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-neutral-300 rounded"
          />
          <label htmlFor="isRestaurantOwner" className="ml-3 text-sm text-neutral-700">
            I am the restaurant owner or an authorized representative
            <span className="block text-xs text-neutral-500 mt-1">
              If checked, we will mark your restaurant as verified when added to our platform
            </span>
          </label>
        </div>
      </div>

      {/* Photo Upload */}
      <div className="pt-4 border-t border-neutral-200">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Photos (Optional)
          <span className="block text-xs text-neutral-500 font-normal mt-1">
            Upload up to 5 photos of the restaurant or food (max 5MB each)
          </span>
        </label>
        
        {/* File Input */}
        <div className="mb-4">
          <label
            htmlFor="photos"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors bg-neutral-50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <PhotoIcon className="h-8 w-8 text-neutral-400 mb-2" />
              <p className="text-sm text-neutral-500">
                <span className="font-medium text-orange-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-neutral-500 mt-1">PNG, JPG, GIF up to 5MB</p>
            </div>
            <input
              id="photos"
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              disabled={photos.length >= 5}
            />
          </label>
        </div>

        {/* Photo Previews */}
        {photoPreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photoPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove photo"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Notes */}
      <div>
        <label htmlFor="submissionNotes" className="block text-sm font-medium text-neutral-700 mb-2">
          Additional Information (Optional)
        </label>
        <textarea
          id="submissionNotes"
          name="submissionNotes"
          rows={4}
          value={formData.submissionNotes}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          placeholder="Tell us about the restaurant, soup specialties, or any other relevant information..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full px-6 py-3 bg-orange-600 text-white font-medium rounded-lg transition-all ${
          isSubmitting
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-orange-700 hover:shadow-md'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Restaurant'}
      </button>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-800 font-medium">
            ✓ Thank you! Your submission has been received. We&apos;ll review it and add the restaurant to our platform soon.
          </p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">
            There was an error submitting your form. Please try again or contact us directly.
          </p>
        </div>
      )}
    </form>
  );
}
