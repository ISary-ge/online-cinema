import { Body, Controller, Get, HttpCode, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { RatingService } from './rating.service';
import { IdValidationPipe } from './../pipes/id.validation.pipe';
import { Types } from 'mongoose';
import { SetRatingDto } from './dto/set-rating.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/user/decorators/user.decorator';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService){}

  @Get(':movieId')
	@Auth()
	async getProfile(@Param('movieId', IdValidationPipe) movieId: Types.ObjectId) {
		return this.ratingService.getMovieValue(movieId)
	}

	@UsePipes(new ValidationPipe())
	@Post('set-rating')
	@HttpCode(200)
	@Auth()
	async updateProfile(@User('_id') _id: Types.ObjectId, @Body() dto: SetRatingDto) {
		return this.ratingService.setRating(_id, dto)
	}

}
