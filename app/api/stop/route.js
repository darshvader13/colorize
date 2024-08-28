import AWS from 'aws-sdk';
import { NextResponse } from 'next/server';

export async function POST(request) {

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

        if (instanceState === 'running') {
            await ec2.stopInstances(params).promise();
            await ec2.waitFor('instanceStopped', params).promise();
        } else {
            return NextResponse.json({ message: 'Instance is not running' }, { status: 200 });
        }

        return NextResponse.json({ error: 'Stopped' }, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
