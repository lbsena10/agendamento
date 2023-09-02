const appointment = require("../models/Appointment")
const mongoose = require("mongoose")
const AppointmentFactory = require("../factories/AppointmentFactory")
const mailer = require("nodemailer")

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
      notified: false,
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

  //query => email
  //query => cpf
  async Search(query) {
    try {
      var appos = await Appo.find().or([{ email: query }, { cpf: query }])
      return appos
    } catch (err) {
      console.log(err)
      return []
    }
  }

  async SendNotification() {
    var appos = await this.GetAll(false)

    const transporter = mailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 25,
      auth: {
        user: "da3311d9f5aa3b",
        pass: "6e6c06ae85e0e3",
      },
    })

    appos.forEach(async (app) => {
      const date = app.start.getTime()
      const hour = 1000 * 60 * 60
      const gap = date - Date.now()

      if (gap <= hour) {
        if (!app.notified) {
          await Appo.findByIdAndUpdate(app.id, { notified: true })

          transporter
            .sendMail({
              from: "Lucas Sena <lucas@lucas.com.br>",
              to: app.email,
              subject: "Sua consulta está próxima!",
              text: "Sua consulta acontecerá em 1 hora",
            })
            .then(() => {
              console.log("email enviado")
            })
            .catch((err) => {
              console.log(err)
            })
        }
      }
    })
  }
}

module.exports = new AppointmentService()
