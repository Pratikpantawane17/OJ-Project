import React from 'react'

const Unauthorized = () => {
  return (
    <div className="text-center mt-10 text-red-600 font-bold">
      <h1>403 - Unauthorized</h1>
      <p>Only admins are allowed to access this resource.</p>
    </div>
  )
}

export default Unauthorized;
