/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.BACKEND_API_URL },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, API-Key' },
        ],
      },
    ]
  },
	images: {
    remotePatterns: [
      {
        protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				pathname: '/**',
      },
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				pathname: '/**',
			}
    ],
  },
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	
};

export default nextConfig;
