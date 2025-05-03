import { expect } from 'chai'
import sinon from 'sinon'
import { Request, Response } from 'express'
import type { NextFunction } from 'express'
import { RateLimitService } from '../services/rateLimit'
import { authRateLimiter, apiKeyRateLimiter, exponentialBackoff } from '../middlewares/rateLimit'
import { RateLimitOptions } from '../interfaces/RateLimit'

describe('Rate Limiting', () => {
    let req: Partial<Request>
    let res: Partial<Response> & {
        status: sinon.SinonStub;
        json: sinon.SinonStub;
        send: sinon.SinonStub;
        set: sinon.SinonStub;
        end: sinon.SinonStub;
    }
    let next: NextFunction & sinon.SinonStub<[Error?], void>
    let clock: sinon.SinonFakeTimers
    let rateLimitService: any

    beforeEach(() => {
        // Set up test doubles
        req = {
            ip: '127.0.0.1',
            originalUrl: '/api/v1/test',
            method: 'GET',
            headers: {}
        }
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
            set: sinon.stub().returnsThis(),
            end: sinon.stub()
        } as any
        next = sinon.stub() as NextFunction & sinon.SinonStub<[Error?], void>
        clock = sinon.useFakeTimers()

        // Mock Redis client
        const redisMock = {
            get: sinon.stub().resolves(null),
            incr: sinon.stub().resolves(1),
            expire: sinon.stub().resolves(1),
            del: sinon.stub().resolves(1),
            call: sinon.stub().resolves(1),
            quit: sinon.stub().resolves()
        }

        // Create a test instance of RateLimitService with mocked Redis
        rateLimitService = RateLimitService.getInstance() as any
        rateLimitService.redisClient = redisMock
    })

    afterEach(() => {
        clock.restore()
        sinon.restore()
    })

    describe('RateLimitService', () => {
        it('should create a rate limiter with the correct options', async () => {
            const options: RateLimitOptions = {
                windowMs: 60000,
                max: 10,
                message: 'Too many requests',
                standardHeaders: true,
                legacyHeaders: false
            }

            const limiter = await rateLimitService.createRateLimiter('test', options)
            expect(limiter).to.be.a('function')
        })

        it('should record rate limit events correctly', () => {
            const event = {
                ip: '127.0.0.1',
                endpoint: '/api/v1/test',
                timestamp: new Date(),
                remaining: 5,
                limit: 10,
                reset: new Date(Date.now() + 60000),
                blocked: false
            }

            rateLimitService.recordRateLimitEvent(event)
            expect(rateLimitService.rateLimitEvents).to.have.lengthOf(1)
            expect(rateLimitService.rateLimitStats.totalRequests).to.equal(1)
            expect(rateLimitService.rateLimitStats.blockedRequests).to.equal(0)
        })

        it('should record blocked rate limit events correctly', () => {
            const event = {
                ip: '127.0.0.1',
                endpoint: '/api/v1/test',
                timestamp: new Date(),
                remaining: 0,
                limit: 10,
                reset: new Date(Date.now() + 60000),
                blocked: true
            }

            rateLimitService.recordRateLimitEvent(event)
            expect(rateLimitService.rateLimitEvents).to.have.lengthOf(1)
            expect(rateLimitService.rateLimitStats.totalRequests).to.equal(1)
            expect(rateLimitService.rateLimitStats.blockedRequests).to.equal(1)
        })

        it('should get rate limit statistics correctly', async () => {
            // Record some events
            rateLimitService.recordRateLimitEvent({
                ip: '127.0.0.1',
                endpoint: '/api/v1/test',
                timestamp: new Date(),
                remaining: 5,
                limit: 10,
                reset: new Date(Date.now() + 60000),
                blocked: false
            })

            rateLimitService.recordRateLimitEvent({
                ip: '192.168.1.1',
                endpoint: '/api/v1/users/register',
                timestamp: new Date(),
                remaining: 0,
                limit: 10,
                reset: new Date(Date.now() + 60000),
                blocked: true
            })

            const stats = await rateLimitService.getRateLimitStats()
            expect(stats.totalRequests).to.equal(2)
            expect(stats.blockedRequests).to.equal(1)
            expect(stats.topBlockedIPs).to.have.lengthOf(1)
            expect(stats.topBlockedEndpoints).to.have.lengthOf(1)
        })
    })

    describe('Rate Limiting Middleware', () => {
        it('should apply auth rate limiter correctly', async () => {
            const middleware = await authRateLimiter('register')
            expect(middleware).to.be.a('function')
            
            // Test the middleware
            await middleware(req as Request, res as Response, next)
            expect((next as sinon.SinonStub).calledOnce).to.be.true
        })

        it('should apply API key rate limiter correctly', async () => {
            const middleware = await apiKeyRateLimiter('create')
            expect(middleware).to.be.a('function')
            
            // Test the middleware
            await middleware(req as Request, res as Response, next)
            expect((next as sinon.SinonStub).calledOnce).to.be.true
        })

        it('should apply exponential backoff correctly', async () => {
            const middleware = exponentialBackoff(3, 1000)
            expect(middleware).to.be.a('function')
            
            // Test the middleware with no previous failures
            await middleware(req as Request, res as Response, next)
            expect((next as sinon.SinonStub).calledOnce).to.be.true
            
            // Test with multiple failures
            rateLimitService.redisClient.get.resolves('3') // 3 previous failures
            
            // Reset next stub
            (next as sinon.SinonStub).reset()
            
            // Call middleware again
            await middleware(req as Request, res as Response, next)
            
            // Should return 429 status
            expect((res.status as sinon.SinonStub).calledWith(429)).to.be.true
            expect((next as sinon.SinonStub).called).to.be.false
        })
    })
})