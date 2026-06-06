"use client";

import { useState, useEffect } from "react";
import { FirebaseDatabaseService } from "@/backend/firebase/db.service";
import { Trash2, Eye, EyeOff, Star } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dbService = new FirebaseDatabaseService();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const allReviews = await dbService.getAllReviews();
      setReviews(allReviews);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await dbService.deleteReview(id);
      setReviews(reviews.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete review");
    }
  };

  const handleToggleStatus = async (review: any) => {
    const newStatus = review.status === 'approved' ? 'hidden' : 'approved';
    try {
      await dbService.updateReviewStatus(review.id, newStatus);
      setReviews(reviews.map(r => r.id === review.id ? { ...r, status: newStatus } : r));
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-black font-semibold">Loading Reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Review, approve, or delete customer feedback.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Product ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4 w-1/3">Review Content</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">{review.productId}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{review.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`w-3.5 h-3.5 ${review.rating >= star ? 'fill-current' : 'opacity-20'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 mb-1">{review.title}</div>
                      <p className="text-xs text-gray-500 line-clamp-2">{review.content}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        review.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(review)}
                          className="p-1.5 text-gray-400 hover:text-black transition-colors rounded"
                          title={review.status === 'approved' ? 'Hide Review' : 'Approve Review'}
                        >
                          {review.status === 'approved' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
