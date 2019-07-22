all: canvas juliaset

canvas: canvas.mk
	$(MAKE) -f $<
juliaset: juliaset.mk
	$(MAKE) -f $<

clean:
	$(MAKE) -f canvas.mk clean
	$(MAKE) -f juliaset.mk clean
