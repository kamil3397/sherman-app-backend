import { Request, Response } from 'express';
import { Collection, Filter } from 'mongodb';

interface Event {
    id?: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string
}

export class CalendarController {
  constructor(private calendarEventsCollection: Collection<Event>) { }

  async addEvent(req: Request, res: Response): Promise<Response> {
    const { title, description, startDate, endDate } = req.body;

    if (!title || !description || !startDate || !endDate) {
      return res.status(400).send({ message: 'Missing required fields' });
    }
    const newEvent: Event = {
      title,
      description,
      startDate,
      endDate
    };
    try {
      await this.calendarEventsCollection.insertOne(newEvent);
      return res.status(201).send({ message: 'New event added successfully', newEvent });
    } catch (error) {
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  }

  async getEvents(req: Request, res: Response) {
    try {

      if (!req.query.startDate || !req.query.endDate) {
        return res.status(400).send({ message: 'Date scope has not been provied' });
      }

      const startDate = new Date(req.query.startDate as string).toISOString();
      const endDate = new Date(req.query.endDate as string).toISOString();

      const events = await this.calendarEventsCollection.find({
        startDate: { $gte: startDate },
        endDate: { $lte: endDate }
      }).toArray();

      if (!events || events.length === 0) {
        return res.status(204).send({ message: 'No events found' });
      }
      return res.status(200).send(events);
    } catch (err) {
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  }
}
