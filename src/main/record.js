const fs = require('fs')
const { spawn } = require('child_process')
const path = require("path")
const NODE_ENV = process.env.NODE_ENV
const {app, screen} = require("electron")
const ffmpegPath = '/assets/ffmpeg'