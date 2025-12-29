import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
    try {
        const result = await cloudinary.api.resources({
            max_results: 50,
            direction: 'desc'
        });
        return NextResponse.json(result.resources);
    } catch (error) {
        console.error('Error fetching Cloudinary resources:', error);
        return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
    }
}
