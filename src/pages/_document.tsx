// esse _document.tsx irá carregar apenas uma vez

import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
    render (){
        return (
            <Html>
                <Head>
                    
                </Head>

                <body>
                    <Main/>
                    <NextScript />
                </body>
            </Html>
        )
    }
}