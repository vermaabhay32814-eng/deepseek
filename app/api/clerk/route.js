import {Webhook} from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import {headers} from "next/headers";
import { NextResponse } from "next/server";


export async function POST(request) {
    const wh = new Webhook(process.env.SIGNING_SECRET);
    const headerPayload = await headers();
    const svixHeaders = {
        "svix-id": headerPayload.get("svix-id"),
        "svix-signature": headerPayload.get("svix-signature"),
        "svix-timestamp": headerPayload.get("svix-timestamp"),
    };

    // Get the paylod and verify it 

    const payload = await request.json();
    const body = JSON.stringify(payload);
    const {data, type} = wh.verify(body, svixHeaders);

    //Prepare the user data to be stored in the database
    const userData = {
        _id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        email: data.email_addresses[0].email_address,
        image: data.image_url,
    };

    await connectDB();

    switch (type) {
        case 'user.created':
            await User.create(userData);
            break;
        case 'user.updated':
            await User.findByIdAndUpdate(data.id, userData);
            break;
        case 'user.deleted':
            await User.findByIdAndDelete(data.id);
            break;
        default:
            break;
    }

    return NextResponse.json({message: "Webhook received successfully"});
}