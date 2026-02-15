import React from 'react'
import MainBanner from '../components/MainBanner'
import Categories from '../components/Categories'
import BestSeller from '../components/BestSeller'
import ButtomBanner from '../components/ButtomBanner'
import NewsLetter from '../components/NewsLetter'

function Home() {
    return (
        <div className='mt-10'>
            <MainBanner />
            <Categories />
            <BestSeller />
            <ButtomBanner />
            <NewsLetter />

        </div>
    )
}

export default Home