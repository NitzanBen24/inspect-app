'use client'
import { useState } from 'react';

export default function TestFormPage() {
  const [formData, setFormData] = useState({
    name: '',
    nick: '',
    email: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'form-data.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to generate PDF');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} />
      </div>
      <div>
        <label>Nick</label>
        <input type="text" name="nick" value={formData.nick} onChange={handleChange} />
      </div>
      <div>
        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} />
      </div>
      <div>
        <label>Message</label>
        <textarea name="message" value={formData.message} onChange={handleChange}></textarea>
      </div>
      <button type="submit">Download PDF</button>
    </form>
  );
}
