import siteService from '../services/siteService'

let handle = (fn) => async (req, res) => {
    try {
        let infor = await fn(req);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        })
    }
}

module.exports = {
    search: handle(req => siteService.search(req.query.q)),
    getListDoctors: handle(req => siteService.getListDoctors(req.query)),
    getStatistics: handle(req => siteService.getStatistics()),
    getBookingsByEmail: handle(req => siteService.getBookingsByEmail(req.query.email)),
    cancelBooking: handle(req => siteService.cancelBooking(req.body)),
}
