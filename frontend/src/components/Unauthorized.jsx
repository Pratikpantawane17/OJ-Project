import React from 'react'

const Unauthorized = () => {
  return (
    <div className="h-screen flex flex-col text-center justify-center items-center text-red-600 font-bold bg-black">
      <h1 className="text-2xl mb-2">403 - Unauthorized</h1>
      <p className="text-lg">Only admins are allowed to access this resource.</p>
    </div>
  )
}

export default Unauthorized;
