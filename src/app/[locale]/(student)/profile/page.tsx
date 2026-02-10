'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { User as UserIcon, Mail, Shield, Edit3, Save, X, Lock, FileText, Phone } from 'lucide-react';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const t = useTranslations('student.profile');

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordPanel, setShowPasswordPanel] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
    });

    // Initialize form data when user loads
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phoneNumber: user.phoneNumber || '',
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            await apiClient.put('/auth/profile', formData);
            await refreshUser();
            toast.success(t('update_success'));
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile', error);
            toast.error(t('common.error') || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendResetLink = async () => {
        if (!user || !user.email) return;
        try {
            await apiClient.post('/auth/forgot-password', { email: user.email });
            toast.success(t('change_password_panel.success_message'));
            setShowPasswordPanel(false);
        } catch (error) {
            console.error('Failed to send reset link', error);
            // Anti-enumeration: Show success message anyway or generic error if network fails
            toast.success(t('change_password_panel.success_message'));
            setShowPasswordPanel(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 relative">
            <Navbar />

            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-12">
                            <h1 className="text-4xl font-extrabold text-slate-900">{t('title')}</h1>
                            <button 
                                onClick={() => setShowPasswordPanel(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                <Lock className="h-4 w-4" />
                                {t('change_password')}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left column - ID Card */}
                            <div className="lg:col-span-4">
                                <div className="rounded-[32px] bg-white p-8 border border-slate-200 shadow-sm text-center sticky top-24">
                                    <div className="relative mx-auto h-28 w-28 mb-6">
                                        <div className="h-full w-full rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-4xl font-black border-4 border-white shadow-lg">
                                            {user?.fullName?.charAt(0) || <UserIcon className="h-10 w-10 opacity-50"/>}
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-1">{user?.fullName}</h2>
                                    <p className="text-slate-500 font-medium text-sm mb-6">{user?.email}</p>
                                    
                                    <div className="flex justify-center gap-2">
                                        <span className="rounded-full bg-green-50 px-4 py-1.5 text-xs font-bold text-green-600 uppercase tracking-widest border border-green-100">
                                            {user?.role === 'STUDENT' ? t('role_student') : t('role_admin')}
                                        </span>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-slate-50 w-full text-left">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t('user_id')}</h4>
                                        <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-600 break-all">
                                            {user?.id}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right column - Editable Info */}
                            <div className="lg:col-span-8">
                                <div className="rounded-[32px] bg-white p-8 sm:p-10 border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-50">
                                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-indigo-600"/>
                                            {t('basic_info')}
                                        </h3>
                                        {!isEditing ? (
                                            <button 
                                                onClick={() => setIsEditing(true)}
                                                className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                                {t('edit')}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => setIsEditing(false)}
                                                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg transition-colors"
                                                    disabled={isLoading}
                                                >
                                                    {t('cancel')}
                                                </button>
                                                <button 
                                                    onClick={handleSave}
                                                    disabled={isLoading}
                                                    className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-70"
                                                >
                                                    {isLoading ? '...' : <><Save className="h-4 w-4" /> {t('save')}</>}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        {/* First Name & Last Name */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                                    {t('first_name')}
                                                </label>
                                                {isEditing ? (
                                                    <input 
                                                        type="text" 
                                                        value={formData.firstName}
                                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-medium"
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold">
                                                        {user?.firstName}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                                    {t('last_name')}
                                                </label>
                                                {isEditing ? (
                                                    <input 
                                                        type="text" 
                                                        value={formData.lastName}
                                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-medium"
                                                    />
                                                ) : (
                                                    <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-bold">
                                                        {user?.lastName}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Email (Read Only) */}
                                        <div className="space-y-2 opacity-75">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <Mail className="h-3 w-3" />
                                                {t('email')}
                                                <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded ml-auto">Read-only</span>
                                            </label>
                                            <div className="px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-100 text-slate-900 font-medium">
                                                {user?.email}
                                            </div>
                                        </div>

                                        {/* Phone Number */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <Phone className="h-3 w-3" />
                                                {t('phone_number')}
                                            </label>
                                            {isEditing ? (
                                                <input 
                                                    type="tel" 
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                                    placeholder="+966 ..."
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-medium"
                                                />
                                            ) : (
                                                <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 font-medium min-h-[48px] flex items-center">
                                                    {user?.phoneNumber || <span className="text-slate-400 italic font-normal text-sm">Not set</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Change Password Side Panel (Overlay) */}
            {showPasswordPanel && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowPasswordPanel(false)}
                    />
                    
                    {/* Panel */}
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">{t('change_password_panel.title')}</h3>
                            <button 
                                onClick={() => setShowPasswordPanel(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="p-8 flex-1 overflow-y-auto">
                            <div className="rounded-2xl bg-indigo-50 p-6 mb-8 border border-indigo-100">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600 mt-1">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-indigo-900 mb-1">Secure Reset Flow</h4>
                                        <p className="text-sm text-indigo-700/80 leading-relaxed">
                                            {t('change_password_panel.subtitle')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700">
                                    {t('change_password_panel.email_label')}
                                </label>
                                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium flex items-center gap-3">
                                    <Mail className="h-4 w-4 opacity-50" />
                                    {user?.email}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button 
                                onClick={handleSendResetLink}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Mail className="h-4 w-4" />
                                {t('change_password_panel.send_link')}
                            </button>
                            <button 
                                onClick={() => setShowPasswordPanel(false)}
                                className="w-full mt-3 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
