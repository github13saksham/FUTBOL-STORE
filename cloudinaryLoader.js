export default function cloudinaryLoader({ src, width, quality }) {
  // If it's a local image (starts with /), just serve it directly
  if (src.startsWith('/')) {
    return src;
  }

  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];
  
  // For Cloudinary Fetch, we MUST safely encode the URL
  // Firebase URLs often have special characters like ?alt=media which break Cloudinary if not encoded
  return `https://res.cloudinary.com/dev9ldgon/image/fetch/${params.join(',')}/${encodeURIComponent(src)}`;
}
