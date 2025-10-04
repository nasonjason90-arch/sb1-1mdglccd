import { useState } from 'react';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Reset Password</h1>
        {sent ? (
          <p className="text-green-700">If an account exists, a reset link has been sent to {email}.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md">Send reset link</button>
          </form>
        )}
      </div>
    </div>
  );
}
