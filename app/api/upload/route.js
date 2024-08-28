import AWS from 'aws-sdk';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { image } = await request.json();

    console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
    console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);

    const ec2 = new AWS.EC2({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
    });

    const instanceId = process.env.EC2_INSTANCE_ID;

    const params = {
        InstanceIds: [instanceId],
    };

    try {
        const instanceData = await ec2.describeInstances(params).promise();
        const instanceState = instanceData.Reservations[0].Instances[0].State.Name;

        if (instanceState !== 'running') {
            await ec2.startInstances(params).promise();
            await ec2.waitFor('instanceRunning', params).promise();
        }

        const publicIp = instanceData.Reservations[0].Instances[0].PublicIpAddress;

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
