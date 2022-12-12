import React from 'react';

const Footer: React.FC = () => {
    return (
        <div className="p-5">
            <p className="text-sm text-left">
                If you have any questions or need help,{' '}
                <a
                    href="https://twitter.com/api_video"
                    className="text-blue-500 underline"
                >
                    tweet
                </a>{' '}
                us or email us at{' '}
                <a href="mailto:help@api.video" className="text-blue-500 underline">
                    help@api.video
                </a>
            </p>
        </div>
    );
};

export default Footer;
