 

"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PaymentPlan } from "@/lib/types/content"; 
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE } from "@/lib/config";  
import { toast } from "sonner"; 
import FullScreenRedirectLoader from "../Loader/FullScreenRedirectLoader";
import { BiChevronLeft } from "react-icons/bi";
import { FiChevronsLeft } from "react-icons/fi";
import { BsChevronLeft } from "react-icons/bs";
import { useRouter } from "next/navigation";
const PlanForm = ({
  initial,
  onSuccess,
  onClose,
}: {
  initial?: PaymentPlan | null;
  onSuccess?: () => void;
  onClose?: () => void;
}) => {
  const navigate = useRouter()
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    price: initial?.price || "",
    currency: "GBP",
    can_access_premium: initial?.can_access_premium || false,
    duration_days: initial?.duration_days || "",
    max_devices: initial?.max_devices || "", 
    ad_supported: initial?.ad_supported || false,
    is_active: initial?.is_active ?? true,
  });

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    price: "",
    duration_days: "",
    max_devices: "", 
    can_access_premium:''
  });

  const [touched, setTouched] = useState({
    name: false,
    description: false,
    price: false,
    duration_days: false,
    max_devices: false, 
    can_access_premium:false
  });

  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [cancelClicked, setCancelClicked] = useState(false);

  const update = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));


  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation logic
  const validateForm = () => {
    const newErrors = {
      name: "",
      description: "",
      price: "",
      duration_days: "",
      max_devices: "", 
      can_access_premium:''
    };

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Plan name is required";
    } else if (form.name.trim().length < 3) {
      newErrors.name = "Plan name must be at least 3 characters";
    } else if (form.name.trim().length > 50) {
      newErrors.name = "Plan name must be less than 50 characters";
    }

    // Description validation
    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (form.description.trim().length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    // Price validation
    if (!form.price || form.price === "") {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(form.price))) {
      newErrors.price = "Price must be a valid number";
    } else if (Number(form.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    } else if (Number(form.price) > 992222222) {
      newErrors.price = "Price must be less than 99 GBP";
    }

    // Duration validation
    if (!form.duration_days || form.duration_days === "") {
      newErrors.duration_days = "Duration is required";
    } else if (isNaN(Number(form.duration_days))) {
      newErrors.duration_days = "Duration must be a valid number";
    } else if (Number(form.duration_days) < 1) {
      newErrors.duration_days = "Duration must be at least 1 day";
    } else if (Number(form.duration_days) > 365) {
      newErrors.duration_days = "Duration must be less than 365 days";
    }

    // Max devices validation
    if (!form.max_devices || form.max_devices === "") {
      newErrors.max_devices = "Max devices is required";
    } else if (isNaN(Number(form.max_devices))) {
      newErrors.max_devices = "Max devices must be a valid number";
    } else if (Number(form.max_devices) < 1) {
      newErrors.max_devices = "Must allow at least 1 device";
    } else if (Number(form.max_devices) > 100) {
      newErrors.max_devices = "Max devices cannot exceed 100";
    }

    setErrors(newErrors);

    // Check if form is valid (no errors)
    const formIsValid = Object.values(newErrors).every((error) => error === "");
    setIsValid(formIsValid);

    return formIsValid;
  };

  // Run validation whenever form changes
  useEffect(() => {
    validateForm();
  }, [form]);

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      description: true,
      price: true,
      duration_days: true,
      max_devices: true, 
      can_access_premium: true

    });

    // Validate before submitting
    if (!validateForm()) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    try {
      setLoading(true);

      if (initial) {
        await axios.put(`${API_BASE}api/v1/payments/plans/${initial.id}`, form, {
          headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`
          }
        });
        toast.success("Plan updated successfully!");

      } else {
        await axios.post(`${API_BASE}api/v1/payments/plans`, form, {
          headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`
          }
        });
        setForm({
        name: "",
        description: "",
        price: "",
        currency: "GBP",
        duration_days: "",
        max_devices: "",
        can_access_premium:false,
        ad_supported: false,
        is_active: true,
      });
      setTouched({name: false,
    description: false,
    price: false,
    can_access_premium:false,
    duration_days: false,
    max_devices: false });  
        toast.success("Plan created successfully!");
      }

      onSuccess?.();
    } catch (error: any) {
      console.error(error);

      // Check if the error response contains field-specific validation errors
      const apiErrors = error?.response?.data;

      if (apiErrors && typeof apiErrors === 'object' && !apiErrors.detail && !apiErrors.message) {
        const newErrors: any = { ...errors };
        
        // Map API errors to form errors
        Object.keys(apiErrors).forEach((fieldName) => {
          const fieldErrors = apiErrors[fieldName];
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            newErrors[fieldName] = fieldErrors[0];
          }
        });

        setErrors(newErrors);
        
        // Mark all fields with errors as touched
        const newTouched: any = { ...touched };
        Object.keys(apiErrors).forEach((fieldName) => {
          newTouched[fieldName] = true;
        });
        setTouched(newTouched);

        toast.error(
          <div className="space-y-1">
            <p className="font-semibold">Validation errors:</p>
            {Object.entries(apiErrors).map(([field, messages]: [string, any]) => (
              <p key={field} className="text-xs">
                • <span className="font-medium">{field}:</span>{' '}
                {Array.isArray(messages) ? messages.join(', ') : messages}
              </p>
            ))}
          </div>
        );
      } else {
        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Something went wrong. Please try again.";

        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {cancelClicked && 
    <FullScreenRedirectLoader message="Wait a minute"/>}
    <div className="w-full mx-auto p-8">
      {/* Header Section */}
      <div
      onClick={()=>{setCancelClicked(true)
        navigate.back()
      }}
      className="w-full flex flex-row items-center justify-start text-neutral-400 mb-12 cursor-pointer hover:text-neutral-200 transition-colors duration-200">
        <BsChevronLeft className="w-6 h-5  mr-1"/>
        <p className="mt-1 ">Go Back</p>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {initial ? "Edit Payment Plan" : "Create New Payment Plan"}
        </h1>
        <p className="text-neutral-400">
          {initial 
            ? "Update the details of your existing payment plan" 
            : "Set up a new subscription plan for your users"}
        </p>
      </div>

      <div className="space-y-6">
        {/* Plan Name */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Plan Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Premium, Basic, Family"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => markTouched("name")}
            className={`w-full px-4 py-3 bg-neutral-700/50 text-white rounded-lg 
               border ${touched.name && errors.name ? 'border-red-500' : 'border-neutral-600'}
               outline-none focus:outline-none 
               focus:ring-2 ${touched.name && errors.name ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent
               transition-all duration-200`}
          />
          {touched.name && errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
          {!errors.name && (
            <p className="text-xs text-neutral-500 mt-1">Choose a memorable name for this plan</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Describe what this plan includes and its key benefits..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            onBlur={() => markTouched("description")}
            rows={4}
            className={`w-full px-4 py-3 bg-neutral-700/50 text-white rounded-lg 
               border ${touched.description && errors.description ? 'border-red-500' : 'border-neutral-600'}
               outline-none focus:outline-none 
               focus:ring-2 ${touched.description && errors.description ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent
               transition-all duration-200 resize-none`}
          />
          {touched.description && errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description}</p>
          )}
          {!errors.description && (
            <p className="text-xs text-neutral-500 mt-1">
              Highlight the features and benefits of this plan ({form.description.length}/500)
            </p>
          )}
        </div>

        {/* Price and Duration Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">£</span>
              <input
                type="number"
                step="0.01"
                placeholder="9.99"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                onBlur={() => markTouched("price")}
                className={`w-full pl-8 pr-4 py-3 bg-neutral-700/50 text-white rounded-lg 
                   border ${touched.price && errors.price ? 'border-red-500' : 'border-neutral-600'}
                   outline-none focus:outline-none 
                   focus:ring-2 ${touched.price && errors.price ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent
                   transition-all duration-200`}
              />
            </div>
            {touched.price && errors.price && (
              <p className="text-xs text-red-500 mt-1">{errors.price}</p>
            )}
            {!errors.price && (
              <p className="text-xs text-neutral-500 mt-1">Monthly subscription price in Great British Pound (GBP)</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Duration (days) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="30"
              value={form.duration_days}
              onChange={(e) => update("duration_days", e.target.value)}
              onBlur={() => markTouched("duration_days")}
              className={`w-full px-4 py-3 bg-neutral-700/50 text-white rounded-lg 
                 border ${touched.duration_days && errors.duration_days ? 'border-red-500' : 'border-neutral-600'}
                 outline-none focus:outline-none 
                 focus:ring-2 ${touched.duration_days && errors.duration_days ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent
                 transition-all duration-200`}
            />
            {touched.duration_days && errors.duration_days && (
              <p className="text-xs text-red-500 mt-1">{errors.duration_days}</p>
            )}
            {!errors.duration_days && (
              <p className="text-xs text-neutral-500 mt-1">How many days this plan lasts (e.g., 30 for monthly)</p>
            )}
          </div>
        </div>

        {/* Max Devices and Ad Support Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Max Devices <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="5"
              value={form.max_devices}
              onChange={(e) => update("max_devices", e.target.value)}
              onBlur={() => markTouched("max_devices")}
              className={`w-full px-4 py-3 bg-neutral-700/50 text-white rounded-lg 
                 border ${touched.max_devices && errors.max_devices ? 'border-red-500' : 'border-neutral-600'}
                 outline-none focus:outline-none 
                 focus:ring-2 ${touched.max_devices && errors.max_devices ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent
                 transition-all duration-200`}
            />
            {touched.max_devices && errors.max_devices && (
              <p className="text-xs text-red-500 mt-1">{errors.max_devices}</p>
            )}
            {!errors.max_devices && (
              <p className="text-xs text-neutral-500 mt-1">Maximum number of devices allowed per subscription</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Ad Support
            </label>
            <select
              value={form.ad_supported ? "true" : "false"}
              onChange={(e) => update("ad_supported", e.target.value === "true")}
              className="w-full px-4 py-3 bg-neutral-700/50 text-white rounded-lg 
                 border border-neutral-600 
                 outline-none focus:outline-none 
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 transition-all duration-200 cursor-pointer"
            >
              <option value="false">No Ads - Premium Experience</option>
              <option value="true">Ad Supported - Lower Price</option>
            </select>
            <p className="text-xs text-neutral-500 mt-1">Will users see advertisements?</p>
          </div>
        </div>

        {/* Plan Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Plan Status
            </label>
            <select
              value={form.is_active ? "true" : "false"}
              onChange={(e) => update("is_active", e.target.value === "true")}
              className="w-full px-4 py-3 bg-neutral-700/50 text-white rounded-lg 
                 border border-neutral-600 
                 outline-none focus:outline-none 
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 transition-all duration-200 cursor-pointer"
            >
              <option value="true">Active - Available to Users</option>
              <option value="false">Inactive - Hidden from Users</option>
            </select>
            <p className="text-xs text-neutral-500 mt-1">Control whether this plan is visible to new subscribers</p>
          </div>
             <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Premium Content Accessibility
            </label>
            <select
              value={form.can_access_premium ? "true" : "false"}
              onChange={(e) => update("can_access_premium", e.target.value === "true")}
              className="w-full px-4 py-3 bg-neutral-700/50 text-white rounded-lg 
                 border border-neutral-600 
                 outline-none focus:outline-none 
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 transition-all duration-200 cursor-pointer"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            <p className="text-xs text-neutral-500 mt-1">Control whether this plan is visible to new subscribers</p>
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      {!isValid && Object.values(touched).some(t => t) && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-sm text-red-500 font-semibold mb-2">Please fix the following errors:</p>
          <ul className="text-xs text-red-400 space-y-1 list-disc list-inside">
            {errors.name && <li>{errors.name}</li>}
            {errors.description && <li>{errors.description}</li>}
            {errors.price && <li>{errors.price}</li>}
            {errors.duration_days && <li>{errors.duration_days}</li>}
            {errors.max_devices && <li>{errors.max_devices}</li>} 
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-neutral-700">
        <Link
        href={'/admin/payment-plans'}
          onClick={()=>{setCancelClicked(true)}}
          className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg
             font-medium transition-all duration-200 
             border border-neutral-600 hover:border-neutral-500"
        >
          Cancel
        </Link>

        <button
          onClick={handleSubmit}
          disabled={loading || !isValid}
          className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 
             hover:from-blue-700 hover:to-blue-800 
             text-white rounded-lg font-medium
             transition-all duration-200 
             shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40
             disabled:opacity-50 disabled:cursor-not-allowed
             disabled:hover:from-blue-600 disabled:hover:to-blue-700
             ${loading ? "animate-pulse" : ""}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Saving...
            </span>
          ) : (
            <span>{initial ? "Update Plan" : "Create Plan"}</span>
          )}
        </button>
      </div>
    </div>
    </>
  );
};

export default PlanForm;