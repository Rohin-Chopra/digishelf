import React, { useState, useEffect } from 'react'
import movieDb from '../api/movieDb'

const MediaCard = ({ media }) => {
  const [imgUrl, setImgUrl] = useState('')
  const fetchMedia = async () => {
    const { data } = await movieDb.get(`/${media.type}/${media.id}`, {
      params: { api_key: '4e02f274e1c605a2e0b08bac93f177e4' }
    })
    setImgUrl(data.poster_path)
  }
  useEffect(() => {
    fetchMedia()
  }, [])

  return (
    <div>
      <img
        className='max-h-96 rounded shadow-lg mt-2'
        alt='random'
        src={`https://image.tmdb.org/t/p/w500//${imgUrl}`}
      />
    </div>
  )
}

export default MediaCard
