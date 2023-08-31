const appointment = require("../models/Appointment")
const mongoose = require("mongoose")
const AppointmentFactory = require("../factories/AppointmentFactory")

const Appo = mongoose.model("Appointment", appointment)

class AppointmentService {
  async Create(name, email, description, cpf, date, time) {
    const newAppo = new Appo({
      name,
      email,
      description,
      cpf,
      date,
      time,
      finished: false,
    })
    try {
      await newAppo.save()
      return true
    } catch (err) {
      console.log(err)
      return false
    }
  }

  async GetAll(showFinished) {
    if (showFinished) {
      return await Appo.find()
    } else {
      const appos = await Appo.find({ finished: false })

      const appointments = []

      appos.forEach((appointment) => {
        if (appointment.date != undefined) {
          appointments.push(AppointmentFactory.Build(appointment))
        }
      })

      return appointments
    }
  }

  async GetById(id) {
    try {
      const event = await Appo.findOne({ _id: id })
      return event
    } catch (err) {
      console.log(err)
    }
  }

  async Finish(id) {
    try {
      await Appo.findByIdAndUpdate(id, { finished: true })
      return true
    } catch (err) {
      console.log(err)
      return false
    }
  }
}

module.exports = new AppointmentService()
