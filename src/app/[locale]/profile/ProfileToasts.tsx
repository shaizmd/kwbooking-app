"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

export default function ProfileToasts() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  useEffect(() => {
    if (success === 'profile') {
      toast.success('Profile updated successfully!');
    } else if (success === 'password') {
      toast.success('Password changed successfully!');
    } else if (error === 'password-mismatch') {
      toast.error('New passwords do not match');
    } else if (error === 'incorrect-password') {
      toast.error('Current password is incorrect');
    } else if (error === 'user-not-found') {
      toast.error('User not found');
    }
  }, [success, error]);

  return null;
}
