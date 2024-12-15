import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { useEffect, useState } from 'react'

export default function Home() {

    return(
        <main>
            <Head>
                <title>Test page</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
        </main>
    )
}