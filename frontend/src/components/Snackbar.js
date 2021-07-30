import React, { useEffect, useState } from 'react'

const Snackbar = ({ color, children, show, setShow }) => {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (show) {
        setShow(false)
      }
    }, 3000)
    const timeout2 = setTimeout(() => {
      if (show) {
        setHidden(true)
      }
    }, 4000)
    return () => {
      clearTimeout(timeout)
      clearTimeout(timeout2)
    }
  }, [show])

  return (
    <div
      className={`flex fixed justify-start items-center bottom-4 md:left-10 md:right-10 md:bottom-10 ${
        hidden ? 'hidden' : ''
      }`}
    >
      <div
        className={`${
          !show ? 'opacity-0' : ''
        } snackbar-body bg-${color} text-white flex px-4 py-4 flex-wrap items-center shadow-lg rounded`}
      >
        {children}
      </div>
    </div>
  )
}

export default Snackbar
