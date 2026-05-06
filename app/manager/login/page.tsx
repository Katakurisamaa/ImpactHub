import AdminLoginForm from "@/components/auth/AdminLoginForm";

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-night-blue z-0" />
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gold/10 rounded-full blur-[120px]" />

            <div className="relative z-10 w-full flex justify-center">
                <AdminLoginForm />
            </div>
        </div>
    );
}
