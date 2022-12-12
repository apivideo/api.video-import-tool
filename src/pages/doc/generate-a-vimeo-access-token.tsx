import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'

const Home: NextPage = () => {

    return (
        <div className="container help-page">
            <main className="main">
                <h1 className="title">
                    How to generate a Vimeo access token
                </h1>

                <div>
                    <p>To work, the Vimeo migration tool needs you to provide it with a Vimeo access token. This access token is used to retrieve the list of your videos, and to access the video source files.</p>
                    <p>The generation of an access token is done in two quick steps:</p>
                    <ul>
                        <li>the creation of a Vimeo application</li>
                        <li>the creation of an access token for this application</li>
                    </ul>

                    <h2>Step 1/2 - Creation of a Vimeo application</h2>
                    <p>To create an application, go to your <a href="https://developer.vimeo.com/apps" rel="noreferrer" target="_blank">Vimeo applications list</a>, and click on <b>Create an app</b></p>
                    <Image width="1030" height="140" alt="Create a Vimeo application" src="/vimeo-create-app.png" />

                    <p>In the application creation form, enter the name &amp; description you want.</p>
                    <p>Select <b>No. The only Vimeo accounts that will have access to the app are my own</b>.</p>
                    <p>Finally, click on <b>Create App</b>.</p>

                    <Image width="972" height="470" alt="Create a Vimeo application" src="/vimeo-app-creation-form.png" />

                    <h2>Step 2/2 - Create an access Token</h2>
                    <p>Once your app has been created, you&apos;ll be redirected to the application settings page.</p>
                    <p>From here, you&apos;ll be able to generate a new access token.</p> 
                    <p>In the <b>Generate an access token</b> section, select <b>Authenticated (you)</b>, check the <b>Private</b> and <b>Video Files</b> check boxes, and then click on <b>Generate</b>.</p>

                    <Image width="737" height="513" alt="Create a Vimeo application" src="/vimeo-create-access-token.png" />

                    <p>Just bellow, a new item will appear with the <b>Token</b> value (<i>8011xxxx...xxx</i> in the screenshoot above), this is the one you&apos;ll have to copy/paste in the migration tool.</p>

                    <Image width="803" height="210" alt="Create a Vimeo application" src="/vimeo-copy-access-token.png" />
                </div>
            </main>
        </div>
    )
}

export default Home
