import { NextRequest, NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            nama,
            email,
            telepon,
            paket,
            totalPrice,
        } = body;

        // Validate required fields
        if (!nama || !email || !telepon || !paket || !totalPrice) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Initialize Midtrans Snap
        const snap = new midtransClient.Snap({
            isProduction: process.env.MIDTRANS_ENVIRONMENT === 'production',
            serverKey: process.env.MIDTRANS_SERVER_KEY || '',
        });

        // Generate unique order ID
        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Prepare transaction parameters
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: totalPrice,
            },
            customer_details: {
                first_name: nama,
                email: email,
                phone: telepon,
            },
            item_details: [
                {
                    id: paket,
                    price: totalPrice,
                    quantity: 1,
                    name: `Paket Iklan ${paket.charAt(0).toUpperCase() + paket.slice(1)} - City Guide 911 FM`,
                },
            ],
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/success`,
                error: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/error`,
                pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/order/pending`,
            },
        };

        // Create transaction
        const transaction = await snap.createTransaction(parameter);

        return NextResponse.json({
            success: true,
            token: transaction.token,
            redirect_url: transaction.redirect_url,
            order_id: orderId,
            message: 'Transaction created successfully',
        });

    } catch (error: any) {
        console.error('Payment error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Failed to create transaction',
                error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        );
    }
}
