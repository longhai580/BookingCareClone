import handbookService from '../services/handbookService'

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
    createHandbook: handle(req => handbookService.createHandbook(req.body)),
    getAllHandbook: handle(req => handbookService.getAllHandbook(req.query.limit)),
    getDetailHandbookById: handle(req => handbookService.getDetailHandbookById(req.query.id)),
    updateHandbook: handle(req => handbookService.updateHandbook(req.body)),
    deleteHandbook: handle(req => handbookService.deleteHandbook(req.body.id)),
}
