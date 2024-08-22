import AWS from 'aws-sdk';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { image } = await request.json();

    // Configure AWS SDK
    const ec2 = new AWS.EC2({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
    });

    const instanceId = process.env.EC2_INSTANCE_ID;

    // Check the current state of the EC2 instance
    const params = {
        InstanceIds: [instanceId],
    };

    try {
        const instanceData = await ec2.describeInstances(params).promise();
        const instanceState = instanceData.Reservations[0].Instances[0].State.Name;

        if (instanceState !== 'running') {
            // Start the instance if it's not running
            await ec2.startInstances(params).promise();
            // Wait for the instance to be in a running state
            await ec2.waitFor('instanceRunning', params).promise();
        }

        // Get the public IP of the EC2 instance
        const publicIp = instanceData.Reservations[0].Instances[0].PublicIpAddress;

        // Call the Flask endpoint on the EC2 instance
        const response = await fetch(`http://${publicIp}:8000/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: image }),
        });

        const result = await response.json();
        console.log(result);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
