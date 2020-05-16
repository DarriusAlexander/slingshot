import { Request, Response, NextFunction, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { Models } from '../models';
import { ModelType } from '../models/Item';
import { Model } from 'mongoose';

const router = Router();

/******************************************************************************
 *                      Endpoint - "/api/meeting/"
 ******************************************************************************/

/**
 * Get all the meetings and their users.
 * 
 * @returns Array<Meeting>
 */
router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .find({
            $or: [
                { type: ModelType.MEETING },
                { type: ModelType.PENDING }
            ]
        })
        .select('-__v')
        .then(documents => {
            res
                .status(OK)
                .json(documents);
        })
        .catch(err => next(err));
});

/**
 * Get specific meeting (could also be a pending one without mined tx) matching a unique id.
 * 
 * @params  id          The id to match with.
 * 
 * @returns Meeting
 */
router.get('/id/:id', async (req: Request, res: Response, next: NextFunction) => {
     Models.Item
         .findOne({
             $and: [
                { _id: req.params.id },
                { $or: [
                    { type: ModelType.MEETING },
                    { type: ModelType.PENDING }
                ]}
             ]
         })
         .select('-__v')
         .then(document => {
             res
                 .status(OK)
                 .json(document);
         })
         .catch(err => next(err));
});

/**
 * Create new meeting with empty meetingAddress.
 * 
 * @params  Meeting     Value of the model.
 * 
 * @returns Meeting
 */
router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .create(req.body)
        .then(document => {
            res
                .status(CREATED)
                .json(document);
        })
        .catch(err => next(err));
});

/**
 * Update meetingAddress once given meeting (txHash) is deployed (mined).
 * The primary key needs to change from tx hash to contract address.
 * However, since we're not allowed to update _id field, we're duplicating the
 * original document with new _id and delete the original one.
 * 
 * @params  txHash          The tx hash to look for.
 * @params  meetingAddress  The contract address to save.
 * 
 * @returns Meeting
 */
router.put('/update', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .findById(req.body['txHash'])
        .then((original: any) => {
            const result = original;
            result.isNew = true;
            result._id = req.body['meetingAddress'];
            result.type = ModelType.MEETING;
            result
                .save()
                .then((document: any) => {
                    Models.Item
                        .findByIdAndDelete(req.body['txHash'])
                        .then((oldDoc: any) => {
                            res
                                .status(CREATED)
                                .json(result);
                        })
                        .catch(err => next(err));
                })
                .catch((err: any) => next(err));
        })
        .catch(err => next(err));
});

/**
 * Update RSVP list both for the given meeting and user.
 * 
 * @params  meetingAddress  The _id to look for.
 * @params  userAddress     The user's address to insert.
 * 
 * @returns Meeting
 */
router.put('/rsvp', async (req: Request, res: Response, next: NextFunction) => {
    Models.Item
        .updateOne(
            { _id: req.body['meetingAddress'], type: ModelType.MEETING },
            { $push: { 'rsvp': req.body['userAddress'] } },
            { safe: true, upsert: true }
        )
        .then(meeting => {
            Models.Item
                .updateOne(
                    { _id: req.body['userAddress'], type: ModelType.USER },
                    { $push: { 'rsvp': req.body['meetingAddress'] } },
                    { safe: true, upsert: true }
                )
                .then(user => {
                    res
                        .status(OK)
                        .json(meeting);
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

export default router;