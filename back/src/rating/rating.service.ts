import { Injectable } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { RatingModel } from './rating.model'
import { MovieService } from 'src/movie/movie.service'
import { Types } from 'mongoose'
import { SetRatingDto } from './dto/set-rating.dto'

@Injectable()
export class RatingService {
	constructor(
		@InjectModel(RatingModel)
		private readonly RatingModel: ModelType<RatingModel>,
		private readonly MovieService: MovieService
	) {}

	async getMovieValue(movieId: Types.ObjectId) {
		return this.RatingModel.findOne({ movieId })
			.select('value')
			.exec()
			.then((data) => (data ? data.value : 0))
	}

  private async _averageRatingByMovie(movieId: Types.ObjectId | string){
    const ratingsMovie: RatingModel[] = await this.RatingModel.aggregate().match({
      movieId: new Types.ObjectId(movieId)
    }).exec()

    return ratingsMovie.reduce((acc, item) => acc + item.value, 0) / ratingsMovie.length
  }

  async setRating(userId: Types.ObjectId, dto: SetRatingDto){
    const {movieId, value} = dto

    const newRating = await this.RatingModel.findOneAndUpdate({movieId, userId},{movieId, userId,value},{
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }).exec()

    const averageRating = await this._averageRatingByMovie(movieId)

    await this.MovieService.updateRating(movieId, averageRating)

    return newRating
  }
}
