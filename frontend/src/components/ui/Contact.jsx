"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import emailjs from "@emailjs/browser"
import EarthCanvas from "./canvas/Earth"
import { SectionWrapper } from "../hoc"
import { slideIn } from "../utils/motion"

const Contact = () => {
  const formRef = useRef()
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("http://localhost:5000/api/get-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setForm({ ...form, email: data.email, name: data.username })
    }
    fetchUser()
  }, [])

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { target } = e
    const { name, value } = target

    setForm({ ...form, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    emailjs
      .send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          to_name: "Muhammad Shahzeb Khan",
          from_email: form.email,
          to_email: "luxumen03@gmail.com",
          message: form.message,
        },
        import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY,
      )
      .then(
        () => {
          setLoading(false)
          alert("Thank you. I will get back to you as soon as possible.")

          setForm({
            name: "",
            email: "",
            message: "",
          })
        },
        (error) => {
          setLoading(false)
          console.error(error)

          alert("Ahh, something went wrong. Please try again.")
        },
      )
  }

  return (
    <>
      <div
        className={`xl:mt-12 flex xl:flex-row flex-col-reverse gap-6 p-6 bg-gradient-to-r from-[#E7FFFE] to-white dark:bg-gradient-to-r dark:from-black dark:to-primary/0.5 
 rounded-2xl max-h-screen overflow-hidden`}
      >
        <motion.div variants={slideIn("left", "tween", 0.2, 1)} className="flex-[0.75] bg-black-100 p-5 rounded-2xl">
          <p className={`text-sm font-medium text-black dark:text-white`}>Get in touch</p>
          <h3 className={`text-2xl font-bold text-black dark:text-white`}>Contact.</h3>

          <form ref={formRef} onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col">
              <span className="text-black dark:text-white font-medium mb-2 text-sm">Your Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="What's your good name?"
                className="bg-white dark:bg-gray-800 py-2 px-4 placeholder:text-gray-500 text-black dark:text-white rounded-lg outline-none border-2 font-medium text-sm"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-black dark:text-white font-medium mb-2 text-sm">Your email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="What's your web address?"
                className="bg-white dark:bg-gray-800 py-2 px-4 placeholder:text-gray-500 text-black dark:text-white rounded-lg outline-none border-2 font-medium text-sm"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-black dark:text-white font-medium mb-2 text-sm">Your Message</span>
              <textarea
                rows={4}
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="What you want to say?"
                className="bg-white dark:bg-gray-800 py-2 px-4 placeholder:text-gray-500 text-black dark:text-white rounded-lg outline-none border-1 font-medium text-sm"
              />
            </label>

            <button
              type="submit"
              className="bg-gray-800 py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md shadow-gray-900"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </motion.div>

        <motion.div
          variants={slideIn("right", "tween", 0.2, 1)}
          className="xl:flex-1 xl:h-[400px] md:h-[350px] h-[250px]"
        >
          <EarthCanvas />
        </motion.div>
      </div>
    </>
  )
}

export default SectionWrapper(Contact, "contact")
