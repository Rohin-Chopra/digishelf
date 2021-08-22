import React, { useState, useEffect } from 'react'
import movieDb from '../api/movieDb'

const MediaCard = ({ children, media }) => {
  const [imgUrl, setImgUrl] = useState('')
  const [mediaHomePage, setMediaHomePage] = useState('')
  const fetchMedia = async () => {
    const { data } = await movieDb.get(`/${media.type}/${media.id}`, {
      params: { api_key: '4e02f274e1c605a2e0b08bac93f177e4' }
    })
    setImgUrl(data.poster_path)
    setMediaHomePage(data.homepage)
  }
  useEffect(() => {
    fetchMedia()
  }, [])

  return (
    <div className='relative'>
      {children}

      <a href={mediaHomePage} target='_blank' rel='noopener noreferrer'>
        <div>
          <img
            className='max-h-96 rounded shadow-lg mt-2'
            alt='random'
            src={`https://image.tmdb.org/t/p/w500//${imgUrl}`}
          />
        </div>
      </a>
    </div>
  )
}

export default MediaCard
