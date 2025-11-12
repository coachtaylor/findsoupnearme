// src/components/forms/RestaurantSubmissionForm.js
import { useEffect, useState } from 'react';
import { BuildingOfficeIcon, EnvelopeIcon, PhoneIcon, GlobeAltIcon, UserIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../contexts/AuthContext';

const CUISINE_OPTIONS = [
  'American',
  'Asian Fusion',
  'Chinese',
  'Filipino',
  'French',
  'Greek',
  'Indian',
  'Italian',
  'Japanese',
  'Korean',
  'Mediterranean',
  'Mexican',
  'Middle Eastern',
  'Thai',
  'Vietnamese',
  'Other',
];

const CUISINE_SOUP_TAGS = {
  American: ['Clam Chowder', 'Chicken Noodle', 'Tomato Soup', 'Chili'],
  Chinese: ['Wonton Soup', 'Hot and Sour', 'Congee'],
  Filipino: ['Sinigang', 'Bulalo', 'Tinola'],
  French: ['French Onion', 'Bouillabaisse'],
  Greek: ['Avgolemono'],
  Indian: ['Rasam', 'Mulligatawny', 'Dal'],
  Italian: ['Minestrone', 'Ribollita', 'Pasta e Fagioli'],
  Japanese: ['Ramen', 'Miso Soup', 'Udon'],
  Korean: ['Kimchi Jjigae', 'Sundubu', 'Doenjang'],
  Mediterranean: ['Lentil Soup', 'Harira'],
  Mexican: ['Pozole', 'Menudo', 'Sopa de Tortilla'],
  'Middle Eastern': ['Lentil Soup', 'Harira', 'Shorbat Adas'],
  Thai: ['Tom Yum', 'Tom Kha'],
  Vietnamese: ['Pho', 'Bun Bo Hue', 'Canh Chua'],
};

const INITIAL_FORM = {
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
  cuisine: '',
  cuisineOther: '',
  soupTags: [],
  soupTagsOther: '',
  isRestaurantOwner: false,
  submissionNotes: '',
};

// Create Supabase client for file uploads
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  return null;
};

export default function RestaurantSubmissionForm({ defaultValues = {}, submissionId = null, onSubmitted = () => {}, onCancelEdit = () => {}, requireOwnerConfirmation = false } = {}) {
  const { session } = useAuth();
  const isEditing = Boolean(submissionId);
  const [formData, setFormData] = useState({ ...INITIAL_FORM, ...defaultValues });
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  useEffect(() => {
    if (!defaultValues) return;

    setFormData((prev) => {
      const next = { ...INITIAL_FORM, ...prev, ...defaultValues };
      if (defaultValues.state) {
        next.state = String(defaultValues.state).toUpperCase();
      }
      if (!Array.isArray(next.soupTags)) {
        next.soupTags = [];
      }
      return next;
    });
  }, [defaultValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'state'
            ? String(value).toUpperCase()
            : value,
    }));
  };

  const toggleSoupTag = (tag) => {
    setFormData((prev) => {
      const exists = prev.soupTags.includes(tag);
      const soupTags = exists ? prev.soupTags.filter((item) => item !== tag) : [...prev.soupTags, tag];
      return { ...prev, soupTags };
    });
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

    const required = (value) => (typeof value === 'string' ? value.trim() : '');
    const optional = (value) => {
      if (typeof value !== 'string') return null;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    };

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

      const tags = Array.isArray(formData.soupTags) ? formData.soupTags.filter(Boolean) : [];
      if (tags.length === 0 && !formData.soupTagsOther.trim()) {
        alert('Please select at least one signature soup or describe it under "Additional soup types".');
        setIsSubmitting(false);
        return;
      }

      if (tags.includes('Other') && !formData.soupTagsOther.trim()) {
        alert('Please describe the other soup type.');
        setIsSubmitting(false);
        return;
      }

      if (requireOwnerConfirmation && !formData.isRestaurantOwner) {
        alert('Please confirm you are the restaurant owner or an authorized representative.');
        setIsSubmitting(false);
        return;
      }

      const normalizedState = formData.state ? String(formData.state).toUpperCase() : '';

      const payload = {
        restaurantName: required(formData.restaurantName),
        address: required(formData.address),
        cuisine: required(formData.cuisine === 'Other' ? formData.cuisineOther : formData.cuisine),
        cuisineRaw: formData.cuisine,
        cuisineOther: formData.cuisineOther,
        soupTags: tags,
        soupTagsOther: formData.soupTagsOther || null,
        city: required(formData.city),
        state: normalizedState,
        zipCode: optional(formData.zipCode),
        phone: optional(formData.phone),
        website: optional(formData.website),
        contactName: required(formData.contactName),
        contactEmail: required(formData.contactEmail),
        contactPhone: optional(formData.contactPhone),
        isRestaurantOwner: !!formData.isRestaurantOwner,
        submissionNotes: optional(formData.submissionNotes),
        photoUrls,
      };

      const headers = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const endpoint = submissionId ? `/api/submissions/${submissionId}` : '/api/submissions';
      const method = submissionId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ ...INITIAL_FORM, ...defaultValues });
        setPhotos([]);
        setPhotoPreviews([]);
        onSubmitted({ submission: data.submission || data, action: submissionId ? 'update' : 'create' });
        if (submissionId) {
          onCancelEdit();
        }
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
          <BuildingOfficeIcon className="h-5 w-5 text-[rgb(var(--primary))]" />
          Restaurant Information
        </h3>
        
        <div>
          <label htmlFor="restaurantName" className="block text-sm font-medium text-neutral-700 mb-2">
            Restaurant Name <span className="text-[rgb(var(--primary))]">*</span>
          </label>
          <input
            type="text"
            id="restaurantName"
            name="restaurantName"
            required
            value={formData.restaurantName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent transition-all"
            placeholder="Enter restaurant name"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-2">
            Address <span className="text-[rgb(var(--primary))]">*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent transition-all"
            placeholder="Street address"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-2">
              City <span className="text-[rgb(var(--primary))]">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent transition-all"
              placeholder="City"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-neutral-700 mb-2">
              State <span className="text-[rgb(var(--primary))]">*</span>
            </label>
            <input
              type="text"
              id="state"
              name="state"
              required
              maxLength="2"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent transition-all uppercase"
              placeholder="State (e.g., NY)"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cuisine" className="block text-sm font-medium text-neutral-700 mb-2">
            Primary cuisine <span className="text-[rgb(var(--primary))]">*</span>
          </label>
          <select
            id="cuisine"
            name="cuisine"
            required
            value={formData.cuisine || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent transition-all"
          >
            <option value="" disabled>
              Select cuisine type
            </option>
            {CUISINE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {formData.cuisine === 'Other' && (
          <div>
            <label htmlFor="cuisineOther" className="block text-sm font-medium text-neutral-700 mb-2">
              Enter cuisine <span className="text-[rgb(var(--primary))]">*</span>
            </label>
            <input
              type="text"
              id="cuisineOther"
              name="cuisineOther"
              required
              value={formData.cuisineOther || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent transition-all"
              placeholder="Describe the cuisine"
            />
          </div>
        )}

        <div>
          <p className="block text-sm font-medium text-neutral-700 mb-2">
            Signature soups (choose at least one) <span className="text-[rgb(var(--primary))]">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {CUISINE_SOUP_TAGS[formData.cuisine] &&
              CUISINE_SOUP_TAGS[formData.cuisine].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleSoupTag(tag)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold border transition ${
                    formData.soupTags.includes(tag)
                      ? 'bg-[rgb(var(--primary))] text-white border-[rgb(var(--primary))]'
                      : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            <button
              type="button"
              onClick={() => toggleSoupTag('Other')}
              className={`rounded-full px-4 py-2 text-xs font-semibold border transition ${
                formData.soupTags.includes('Other')
                  ? 'bg-[rgb(var(--primary))] text-white border-[rgb(var(--primary))]'
                  : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              Other
            </button>
          </div>
        </div>

        {formData.soupTags.includes('Other') && (
          <div>
            <label htmlFor="soupTagsOther" className="block text-sm font-medium text-neutral-700 mb-2">
              Additional soup types <span className="text-[rgb(var(--primary))]">*</span>
            </label>
            <input
              type="text"
              id="soupTagsOther"
              name="soupTagsOther"
              value={formData.soupTagsOther || ''}
              required
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent transition-all"
              placeholder="Describe other soups served"
            />
          </div>
        )}

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
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent transition-all"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 pt-4 border-t border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-[rgb(var(--primary))]" />
          Your Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-neutral-700 mb-2">
              Your Name <span className="text-[rgb(var(--primary))]">*</span>
            </label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              required
              value={formData.contactName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent transition-all"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-1">
              <EnvelopeIcon className="h-4 w-4" />
              Email <span className="text-[rgb(var(--primary))]">*</span>
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              required
              value={formData.contactEmail}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent transition-all"
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
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent transition-all"
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
            className="mt-1 h-4 w-4 text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary))]/40 border-neutral-300 rounded"
          />
          <label htmlFor="isRestaurantOwner" className="ml-3 text-sm text-neutral-700">
            I am the restaurant owner or an authorized representative
            {requireOwnerConfirmation && (
              <span className="text-[rgb(var(--primary))] font-semibold"> *</span>
            )}
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
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-[rgb(var(--primary))]/30 transition-colors bg-neutral-50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <PhotoIcon className="h-8 w-8 text-neutral-400 mb-2" />
              <p className="text-sm text-neutral-500">
                <span className="font-medium text-[rgb(var(--primary))]">Click to upload</span> or drag and drop
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
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent transition-all"
          placeholder="Tell us about the restaurant, soup specialties, or any other relevant information..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full px-6 py-3 bg-[rgb(var(--primary))] text-white font-medium rounded-lg transition-all ${
          isSubmitting
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:opacity-90 hover:shadow-md'
        }`}
      >
        {isSubmitting ? (isEditing ? 'Saving...' : 'Submitting...') : isEditing ? 'Save changes' : 'Submit Restaurant'}
      </button>

      {isEditing && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="w-full px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg transition-all hover:bg-neutral-50"
        >
          Cancel editing
        </button>
      )}

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
