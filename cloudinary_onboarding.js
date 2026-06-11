const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with inline credentials
cloudinary.config({
  cloud_name: 'dev9ldgon',
  api_key: '432473445274845',
  api_secret: 'fBflVWdopbWjUXCfzpJyVYKgw60'
});

async function run() {
  try {
    // 2. Upload an image from Cloudinary's demo domain
    console.log("Uploading sample image...");
    const uploadResult = await cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/sample.jpg", {
      public_id: "test_upload_sample"
    });
    
    console.log("Upload successful!");
    console.log(`Secure URL: ${uploadResult.secure_url}`);
    console.log(`Public ID: ${uploadResult.public_id}`);

    // 3. Get image details
    console.log("\nImage Details:");
    console.log(`Width: ${uploadResult.width}px`);
    console.log(`Height: ${uploadResult.height}px`);
    console.log(`Format: ${uploadResult.format}`);
    console.log(`File Size: ${uploadResult.bytes} bytes`);

    // 4. Transform the image
    // f_auto: automatically chooses the most efficient image format (like webp or avif) based on the requesting browser
    // q_auto: automatically analyzes the image and applies the optimal level of compression to reduce file size without losing visual quality
    const transformedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',
      quality: 'auto'
    });

    console.log("\nDone! Click link below to see optimized version of the image. Check the size and the format.");
    console.log(`Transformed URL: ${transformedUrl}`);

  } catch (error) {
    console.error("Error during Cloudinary operations:", error);
  }
}

run();
