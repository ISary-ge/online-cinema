import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { CreateGenreDto } from './dto/create-genre.dto'
import { GenreModel } from './genre.model'

@Injectable()
export class GenreService {
	constructor(
		@InjectModel(GenreModel) private readonly GenreModel: ModelType<GenreModel>
	) {}

	async bySlug(slug: string) {
		const doc = await this.GenreModel.findOne({ slug }).exec()
		if (!doc) throw new NotFoundException('Genre not found')
		return doc
	}

	async getAll(searchTerm?: string) {
		let options = {}

		if (searchTerm) {
			options = {
				$or: [
					{
						name: new RegExp(searchTerm, 'i'),
					},
					{
						slug: new RegExp(searchTerm, 'i'),
					},
					{
						description: new RegExp(searchTerm, 'i'),
					},
				],
			}
		}

		return this.GenreModel.find(options).select('-updatedAt -__v').sort({
			countMovies: -1,
		})
	}

	async getCollections() {
		const genres = await this.getAll()
		const collections = genres
		return collections
	}

	// async getMostPopular() {
	// 	return this.GenreModel.find({	movies: {	$gt: 0	}	})
	// 		.sort({movies.length: -1})
	// 		.exec()
	// }

	async updateCountMovies(genreIds: string[]) {
		const updateGenres = await Promise.all(
			genreIds.map(async (_id) => {
				await this.GenreModel.findOneAndUpdate(
					{ _id },
					{
						$inc: { countMovies: 1 },
					},
					{
						new: true,
					}
				)
					.select('countMovies')
					.exec()
			})
		)

		if (updateGenres.length !== updateGenres.length)
			throw new BadRequestException('Count movies not updated')

		return updateGenres
	}

	/* Admin place */
	async byId(_id: string) {
		const genre = await this.GenreModel.findById(_id)
		if (!genre) throw new NotFoundException('Genre not found')

		return genre
	}

	async create() {
		const defaultValue: CreateGenreDto = {
			name: '',
			slug: '',
			description: '',
			icon: '',
		}

		const genre = await this.GenreModel.create(defaultValue)

		return genre._id
	}

	async update(_id: string, dto: CreateGenreDto) {
		const updateDoc = await this.GenreModel.findByIdAndUpdate(_id, dto, {
			new: true,
		}).exec()

		if (!updateDoc) throw new NotFoundException('Genre not found')

		return updateDoc
	}

	async delete(id: string) {
		const deleteDoc = await this.GenreModel.findByIdAndDelete(id).exec()

		if (!deleteDoc) throw new NotFoundException('Genre not found')

		return deleteDoc
	}
}
